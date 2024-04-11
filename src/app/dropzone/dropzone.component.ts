import { Component, OnInit } from '@angular/core';
import Dropzone from 'dropzone';

@Component({
  selector: 'app-dropzone',
  templateUrl: './dropzone.component.html',
  styleUrls: ['./dropzone.component.scss']
})
export class DropzoneComponent implements OnInit {
  dropzone?: Dropzone;

  ngOnInit(): void {

    this.dropzone = new Dropzone('#my-dropzone', {
      url: 'https://storage-service-dev-4twhrljvua-de.a.run.app/file?upload_token=fe464549-9495-41ed-9aa6-1b0ce872f717',
      success: (file) => {
        const rsp = file.xhr?.responseText;
        console.log(JSON.parse(rsp!));
      },
      error(file, message, xhr) {
        console.log(message);
      },
    });
  }
}
