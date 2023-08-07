const mongoose = require("mongoose");
const { DeleteObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

// Configuração inicial do AWS S3
const S3 = new S3Client({
    signatureVersion: "v3",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID, // store it in .env file to keep it safe
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_DEFAULT_REGION // this is the region that you select in AWS account
});

// Define o schema do Post
const PostSchema = new mongoose.Schema({
    name: String,
    size: Number,
    key: String,
    url: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

/**
 * Middleware de pré-save para adicionar URL do arquivo caso não seja fornecido.
 */
PostSchema.pre("save", function () {
    if (!this.url) {
        this.url = `${process.env.APP_URL}/files/${this.key}`;
    }
});

/**
 * Middleware de pré-remoção para deletar arquivos associados ao post.
 * Se o STORAGE_TYPE for 's3', o arquivo será deletado do AWS S3. Caso contrário, do sistema de arquivos local.
 */
PostSchema.pre("deleteOne", { document: true }, async function () {
    const command = new DeleteObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: this.key
      });

    if (process.env.STORAGE_TYPE === "s3") {
        console.log("File Found in S3")
        return await S3
            .send(command)
            .then((response) => {
                console.log(response);
            })
            .catch((response) => {
                console.log(response);
            });
    } else {
        // Deleta o arquivo do sistema de arquivos local.
        return promisify(fs.unlink)(
            path.resolve(__dirname, "..", "..", "tmp", "uploads", this.key)
        );
    }
});

module.exports = mongoose.model("Post", PostSchema);