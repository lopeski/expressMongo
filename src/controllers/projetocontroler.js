const express = require('express');
const router = express.Router();
const secredo = require('../meiodocaminho/index.js');
const task = require('../models/task.js');
const project = require('../models/projects.js');


router.use(secredo);

router.get('/', async (req, res) => {
    try {
        const projects = await project.find().populate(['user', 'tasks']);
        return res.send({ projects })
    } catch (erro) {
        console.log(erro);
        return res.status(400).send({ error: 'Error loading projects' });
    }
});
router.get('/:projectId', async (req, res) => {
    res.send({  user: req.userId });
});
router.post('/',  async (req, res) => {
    try {
        const { title, description, tasks } = req.body;
        const projeto = await project.create({ title, description, user: req.userId });

        await Promise.all(task.map(async task => {
            const projectTask = new task({ ...task, project: project._id });
            await projectTask.save();
            projeto.tasks.push(projectTask);
        }));
        await project.save();
        return res.send({ projeto })
    } catch(erro) {
        console.log(erro);
        return res.status(400).send({ error: 'Erro create new project' });
    }
});
router.put('/:projectId', async (req, res) => {
        try {
        const { title, description, tasks } = req.body;
        const projeto = await project.findByIdAndUpdate(req.params.projectId,{ 
            title,
            description, 
        },  { new: true });

        project.tasks = [];
        await task.remove({ project: project._id });
        

        await Promise.all(task.map(async task => {
            const projectTask = new task({ ...task, project: project._id });
            await projectTask.save();
            projeto.tasks.push(projectTask);
        }));
        await project.save();
        return res.send({ projeto })
    } catch(erro) {
        console.log(erro);
        return res.status(400).send({ error: 'Erro update project' });
    }
});
router.delete('/:projectId', async (req, res) => {
    try {
        await project.findByIdAndRemove(req.params.projectId);
        return res.send({ Sucess: 'Projeot deletado' })
    } catch (erro) {
        console.log(erro);
        return res.status(400).send({ error: 'Error loading projects' });
    }
});
module.exports = (app) => app.use('/projects', router);
