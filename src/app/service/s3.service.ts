import {_REKOGNITION_BUCKET} from "./properties.service";

/**
 * Created by vova on 11/22/16.
 */

declare var AWS: any;

export class S3Service {

    albumName = "usercontent";
    bucketRegion = 'us-east-1';
    IdentityPoolId = 'us-east-1:fbe0340f-9ffc-4449-a935-bb6a6661fd53';

    constructor() {

    }

    private getS3(): any {
        AWS.config.update({
            region: this.bucketRegion,
        });

        var s3 = new AWS.S3({
            region: this.bucketRegion,
            apiVersion: '2006-03-01',
            params: {Bucket: _REKOGNITION_BUCKET}
        });

        return s3
    }

    public addPhoto(selectedFile): boolean {
        if (!selectedFile) {
            console.log('Please choose a file to upload first.');
            return;
        }
        let fileName = selectedFile.name;
        let albumPhotosKey = this.albumName + '/' + AWS.config.credentials.identityId + "/";
        let photoKey = albumPhotosKey + fileName;

        this.getS3().upload({
            Key: photoKey,
            ContentType: selectedFile.type,
            Body: selectedFile,
            StorageClass: 'STANDARD',
            ACL: 'private'
        }, function (err, data) {
            if (err) {
                console.log('There was an error uploading your photo: ', err);
                return false;
            }
            console.log('Successfully uploaded photo.');
            return true;
        });
    }

    public deletePhoto(albumName, photoKey) {
        // this.getS3().deleteObjectStore("").promise().then(function () {
        //
        // }
        this.getS3().deleteObject({Key: photoKey}, function (err, data) {
            if (err) {
                console.log('There was an error deleting your photo: ', err.message);
                return;
            }
            console.log('Successfully deleted photo.');
        });
    }

    public viewAlbum(albumName) {
        var albumPhotosKey = encodeURIComponent(this.albumName) + '//';
        this.getS3().listObjects({Prefix: albumPhotosKey}, function (err, data) {
            if (err) {
                console.log('There was an error viewing your album: ' + err);
            }

        });
    }

}