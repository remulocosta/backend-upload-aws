const routes = require('express').Router();
const multer = require('multer');
const multerConfig = require('./config/multer');
const Post = require('./models/Post');

/**
 * Rota para buscar todos os posts.
 * 
 * @returns {Array} Lista de todos os posts.
 */
routes.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find();
        return res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        return res.status(500).send('Internal server error');
    }
});

/**
 * Rota para criar um novo post.
 * Utiliza o middleware do multer para o tratamento de uploads de arquivo.
 * 
 * @returns {Object} O post criado.
 */
routes.post('/posts', multer(multerConfig).single('file'), async (req, res) => {
    try {
        const { originalname: name, size, key, location: url = '' } = req.file;

        const post = await Post.create({
            name,
            size,
            key,
            url
        });

        return res.json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).send('Internal server error');
    }
});

/**
 * Rota para excluir um post específico.
 * 
 * @param {string} id - O ID do post a ser excluído.
 * @returns {string} Uma resposta vazia indicando sucesso.
 */
routes.delete('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).send('Post not found');
        }

        await post.deleteOne();
        return res.send();
    } catch (error) {
        console.error('Error deleting post:', error);
        return res.status(500).send('Internal server error');
    }
});

module.exports = routes;