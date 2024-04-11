# Storage Service

## 儲存服務 client 端範例。
__在相關 token 準備好的狀況下，跟一般檔案上傳流程一樣，以下範例：__
```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <title>檔案上傳範例</title>
</head>
<body>
    <h1>檔案上傳範例</h1>
    <input type="file" id="file-input" accept=".txt, .pdf, .doc">
    <button id="upload-button">上傳檔案</button>

    <script>
        const fileInput = document.getElementById('file-input');
        const uploadButton = document.getElementById('upload-button');

        uploadButton.addEventListener('click', () => {
            const file = fileInput.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('file', file);

                const uploadUrl = 'https://storage.1campus.net/file?upload_token=fe464549-9495-41ed-9aa6-1b0ce872f717';
                fetch(uploadUrl, {
                    method: 'POST',
                    body: formData,
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                });
            } else {
                console.log('請選擇要上傳的檔案');
            }
        });
    </script>
</body>
</html>

```

上傳完成後 json 裡包含的資料：
```json
[
	{
		"form_field": "file",
		"filename": "IU.jpeg",
		"fileid": "dmu1irhvpfi8",
		"expiry": "2023-10-13T10:20:28+08:00",
    "modify_token": "8cad4f5d-6ee3-4a7d-9ae7-227a4141cc56"
	}
]
```
- __form_field__ 上傳檔案時的 Form 欄位名稱。
- __filename__ 使用者上傳時本機的檔案名稱。
- __fileid__ 下載檔案時需要的檔案 id。
- __modify_token__ 如果需要刪除檔案或是重新上傳，需要將此 tokne 記錄。
- __expiry__ 檔案過期時間。

__檔案下載方式__  
當你完成上傳之後，在 response 中會取得 fileid，這個就是檔案識別資訊，下載時使用下面 url 即可下載檔案：
```url
GET https://storage.1campus.net/file/<fileid>
```
如果要指定下載的檔名，可以使用「`dl`」參數：
```url
GET https://storage.1campus.net/file/<fileid>?dl=true # 使用「檔案上傳」時的檔名。
```
```url
GET https://storage.1campus.net/file/<fileid>?dl=我的檔名.jpg # 使用自定的檔名。
```

## Server 端實作說明。

Server 端需要實作兩件事，一個是取得 access token，第二個是建立 upload token，upload tokne 是一個限時的 token，可以用於 client 端上傳檔案用。使用方式請參考 client 範例程式。

### Access Token 取得
- 程式中使用的 access token 是透過 client credential 流程取得，這部份 api 只能透過 server 端呼叫。
  - Api Url
  ```url
  https://devapi.1campus.net/oauth/token?grant_type=client_credentials&client_id=<client_id>&client_secret=<client_secret>&scope=storage
  ```
  - client id 請到 1campus 申請。
  - 如果你已經有類似的呼叫，只要加上「storage」這個 scope 就行了。
  - web gadget 目前不支援 storage service，需要有獨立 server (OHA、聯絡簿...) 的才有辨法使用，有需要可以討論。

### Upload Token 取得
- 程式中使用的 upload token 是透過 access token 換得，此 api service 不允許 CORS。
  - Api Url
  ```url
  POST https://storage.1campus.net/token?access_token=d128831c1d01f3330f404328537dbaaa
  ```
  - Request
    - Example
      ```json
      {
        "dsns": "dev.sh_d",
        "remaining_uploads": 10,
        "max_size": 5242880,
        "expiry_hours": 0
      }
      ```
    - __dsns__：如果你的 client id 沒有該校的授權是無法指定 dsns 取得 token 的，這個屬性大部狀態下都需要指定，如果沒有指定 dsns，上傳的檔案會屬於你的應用程式，而不是學校，並且計費上會算到你的應用上。
    - __remaining_uploads__：此 upload token 可上傳的檔案數量，如果沒有指定預設定是 `100` 個。
    - __max_size__：單個檔案的最大容量，預設為「`5,242,880`(1024 * 1024 * 5)(5MB)」
    - __expiry_hours__：檔案的存活期，以小時為單位，預設為 1 週，如果指定 0 則是無限期。過期的檔案再也無法下載，並且會被刪除。

  - Response
    - Example
    ```json
    {
      "id": 53,
      "token": "b4692809-1381-4cd9-8944-67950e75b1c8",
      "restrictions": {
        "dsns": "dev.sh_d",
        "max_size": 5242880,
        "client_id": "c0b2989f33d24a0d7706465523c605a7",
        "expiry_hours": 0,
        "remaining_uploads": 11
      },
      "create_at": "2023-10-05T16:16:37+08:00",
      "update_at": "2023-10-05T16:16:37+08:00",
      "valid_until": "2023-10-06T16:16:37+08:00",
      "ref_client_id": 2
    }
    ```
    - 這裡需要關心的只有「__token__」，此 token 就是 upload token。
    - __restrictions__ 的內容就是用於檔案的設定。
    - __valid_until__ 這個屬性並非檔案的到期時間，是這個 upload token 的有效時間。

## Upload Tokne 應用方式

upload token 設計用途是在 client 流通的安全識別資訊，可以想像是暫時的上傳通行證。因為會在 client 端使用，所以對於資源存取範圍限制應該愈小愈好，可能有下列幾種應用方式：
  - 使用者啟動應用程式後就建立，並且使用者的整個操作過程只使用同一個 upload token (token 無法跨校使用)。
  - 使用者進入有上傳需求的畫面時才建立，並且在離開畫面後就丟棄或刪除。
  - 使用者在按下上傳按鈕時才建立，完成後 token 就丟棄或刪除。

上面三種方式都是可行的用法，第一種可能比較簡單，但較不安全，因為使用者會上傳多少檔案難以預測，所以 token 的限制條件通常會需要開的很大。最好的方式是第三種，但是不見得所有的上傳 library 都支援這樣動態指定上傳的位置，所以以請依實際狀況選擇。
# storage_example
