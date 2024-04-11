import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import Dropzone from 'dropzone';
import { lastValueFrom } from 'rxjs';

// upload token: fe464549-9495-41ed-9aa6-1b0ce872f717

@Component({
  selector: 'app-cors',
  templateUrl: './cors.component.html',
  styleUrls: ['./cors.component.scss']
})
export class CorsComponent implements OnInit {

  constructor(
    private http: HttpClient,
  ) { }

  async ngOnInit() {
  }

  upload() {
    const fileInput = document.getElementById('file-input')! as HTMLInputElement;
    const file = fileInput.files![0];

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
  }
}
