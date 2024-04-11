import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-reactive',
  templateUrl: './reactive.component.html',
  styleUrls: ['./reactive.component.scss']
})
export class ReactiveComponent implements OnInit {

  uploadForm = new FormGroup({
    files: new FormArray([
      new FormGroup({
        name: new FormControl(''),
        file: new FormControl(null)
      }),
      new FormGroup({
        name: new FormControl(''),
        file: new FormControl(null)
      }),
      new FormGroup({
        name: new FormControl(''),
        file: new FormControl(null)
      })
    ])
  });

  get files() {
    return this.uploadForm.get('files') as FormArray;
  }

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.uploadForm.valueChanges.subscribe(value => {
      const formData = new FormData();
      this.files.controls.forEach((control, i) => {
        const file = control.get('file')?.value;
        formData.append("file" + i, file);
      });

      this.files.controls.forEach((_, i) => {
        console.log(formData.get('file' + i));
      });
    });
  }

  onFileChange(event: Event, i: number) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.item(0); // 單選，只處理第一個檔案。

    if (file) {
      this.files.at(i).patchValue({
        file
      });
    }
  }
}
