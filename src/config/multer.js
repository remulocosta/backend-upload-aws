const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");

// Constante que define o tamanho máximo do arquivo (3MB)
const MAX_SIZE_THREE_MEGABYTES = 3 * 1024 * 1024;

// create s3 instance using S3Client 
// (this is how we create s3 instance in v3)
const S3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID, // store it in .env file to keep it safe
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_DEFAULT_REGION // this is the region that you select in AWS account
});

/**
 * Configurações de armazenamento do multer.
 * 
 * `local`: Armazena os arquivos no disco local.
 * `s3`: Armazena os arquivos no Amazon S3.
 */
const storageTypes = {
    local: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.resolve(__dirname, "..", "..", "tmp", "uploads"));
        },
        filename: (req, file, cb) => {
            crypto.randomBytes(16, (err, hash) => {
                if (err) cb(err);

                file.key = `${hash.toString("hex")}-${file.originalname}`;

                cb(null, file.key);
            });
        },
    }),
    s3: multerS3({
        s3: S3,
        bucket: process.env.BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: "public-read",
        key: (req, file, cb) => {
            crypto.randomBytes(16, (err, hash) => {
                if (err) cb(err);

                const fileName = `${hash.toString("hex")}-${file.originalname}`;

                cb(null, fileName);
            });
        },
    }),
};

module.exports = {
    dest: path.resolve(__dirname, "..", "..", "tmp", "uploads"),
    storage: storageTypes[process.env.STORAGE_TYPE],
    limits: {
        fileSize: MAX_SIZE_THREE_MEGABYTES,
    },
    // Filtro para determinar quais tipos de arquivos são permitidos.
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            "image/jpeg",
            "image/pjpeg",
            "image/png",
            "image/gif",
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type."));
        }
    },
};