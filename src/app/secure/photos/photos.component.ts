import {Component} from "@angular/core";
import {S3Service} from "../../service/s3.service";

export class Photo {
    url: String
    tags: Array<String>
}

@Component({
    selector: 'awscognito-angular2-app',
    templateUrl: './photos.html',
    styleUrls: ['./photos.css'],
    providers: [S3Service]
})
export class PhotosComponent {
    photos: Array<Photo> = null;
    searchQuery: any;
    photosArray: Array<string>;

    constructor(public s3Service: S3Service) {
        this.photosArray =
            ["this", "is", "array", "of", "text"];
    }

    valuechange(event) {
        this.updatePhotoGrid(event)
    }

    updatePhotoGrid(query) {

    }

    addPhoto(event: any) {
        let files = event.srcElement.files;

        if (!files.length) {
            console.log('Please choose a file to upload first.');
            return;
        }

        let file = files[0];

        this.s3Service.addPhoto(file)
    }

    deletePhoto(event: any) {
        this.s3Service.deletePhoto("", "")
    }
}