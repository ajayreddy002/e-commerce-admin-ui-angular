import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { catchError, map, of } from 'rxjs';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  baseUrl = 'http://localhost:3000';
  isFormShow = false;
  productForm!: FormGroup;
  categories: any[] = [];
  files: any[] = [];
  subCategories: any;
  isFormInvalid = false;
  constructor(
    private httpClient: HttpClient,
    private formBuilder: FormBuilder,
    private messageService: MessageService
  ) {}
  ngOnInit(): void {
    this.getProducts();
    this.productForm = this.formBuilder.group({
      name: ['', Validators.required],
      price: ['', Validators.required],
      sub_category: ['', Validators.required],
      category: ['', Validators.required],
    });
    this.getCategories();
    this.getSubCategories();
  }
  onFileChange(event: any) {
    console.log(event.target.files);
    this.files = [];
    for (let index = 0; index < event.target.files.length; index++) {
      this.files.push(event.target.files[index]);
    }
    console.log(this.files);
  }
  getCategories() {
    this.httpClient
      .get(this.baseUrl + '/categories')
      .pipe(
        catchError((err) => {
          console.log(err);
          return of(null);
        })
      )
      .subscribe((data: any) => {
        if (data && data.length > 0) {
          this.categories = data;
        }
      });
  }
  getSubCategories() {
    this.httpClient
      .get(this.baseUrl + '/sub-categories')
      .pipe(
        catchError((err) => {
          console.log(err);
          return of(null);
        })
      )
      .subscribe((data: any) => {
        if (data && data.length > 0) {
          this.subCategories = data;
        }
      });
  }
  getProducts() {
    this.httpClient
      .get(this.baseUrl + '/products')
      .pipe(
        catchError((err) => {
          console.log(err);
          return of(null);
        })
      )
      .subscribe((data: any) => {
        if (data && data.length > 0) {
          data = data.map((item: { images: string }) => {
            item.images = JSON.parse(item.images);
            return item;
          });
          this.products = data;
        } else {
          this.products = [];
        }
      });
  }
  onFormSubmit() {
    if (this.productForm.valid && this.files.length > 0) {
      this.isFormInvalid = false;
      const formData = new FormData();
      formData.append('name', this.productForm.get('name')?.value);
      formData.append('price', this.productForm.get('price')?.value);
      formData.append('category', this.productForm.get('category')?.value);
      formData.append(
        'sub_category',
        this.productForm.get('sub_category')?.value
      );
      for (let i = 0; i < this.files.length; i++) {
        formData.append('images', this.files[i], this.files[i]['name']);
      }
      console.log('form data variable :   ' + formData.toString());
      this.httpClient
        .post(this.baseUrl + '/create-product', formData)
        .pipe(
          catchError((err: HttpErrorResponse) => {
            console.log(err);
            if (err.status === 400) {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Required params are missing',
              });
            }
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Something went wrong',
            });
            return of(null);
          })
        )
        .subscribe((data: any) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Product added successfully',
          });
          this.getProducts();
          this.isFormShow = false;
        });
    } else {
      this.isFormInvalid = true;
    }
  }
  deleteProduct(id: number) {
    this.httpClient
      .delete(`${this.baseUrl}/product/${id}`)
      .pipe(
        catchError((err) => {
          console.log(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Something went wrong',
          });
          return of(null);
        })
      )
      .subscribe((data: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Product deleted successfully',
        });
        this.getProducts();
      });
  }
}
