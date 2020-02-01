const express = require('express');
const User = require('../models/user.js');
const router = express.Router();
const bcrypt = require('bcryptjs');
const secredo = require('../Config/auth.json');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../configEmail/mailer.js');


function generacaodeToken(params = {}) {
    return jwt.sign({ params }, secredo.secret, {
        expiresIn: 86400,
    });
}

router.post('/register', async (req, res) => {
    try {
        const user = await User.create(req.body);
        console.log('entro um fulano')
        return res.send({ user, token: generacaodeToken(user.id)});
    } catch (erro) {
        console.log('nao entrou um fulano')
        return res.status(400).send({ error: 'Registration failed' });
                                                                                                                                                                                                                                                                   
    }
});

router.post('/autenticacao', async (req, res) => {
    const { email, password } = req.body;
    const user = await (await (await User.findOne({ email }).select('+password')));

    if (!user) {
        return res.status(400).send({ error: 'User not found' });    
    } else if (!await bcrypt.compare(password, user.password)) {
        return res.status(400).send({ error: 'Invalid password' })
    } else {
        console.log('Um fulano logou')
        res.send({ user, token: generacaodeToken(user.id)});
    }
});
/*
router.post('/recuperar', async (req, res) => {
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).send({ error: 'User not found' });
    } else {
    const token = crypto.randomBytes(20).toString('hex');
    const now = new Date();
    now.setHours(now.getHours() + 1);
    await User.findByIdAndUpdate(user.id, {
        '$set': {
            passwordResetToken: token,
            passwordResetExpires: now,
        }
    })
    }
});
*/
router.post('/resetSenha', async (req, res) => {
    const { email, token, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send({ error: 'User not found' });
        } else if (token !== user.passwordResetToken) {
            return res.status(400).send({ error: 'Token invalid' });
        } else {
            const now = new Date();
            if (now > user.passwordResetExpires) {
                return res.status(400).send({ error: 'Token expired, generate a new one' });
            } else {
                user.password = password
                await user.save();
                res.send();
            }
        }
    } catch (error) {
        res.status(400).send({ erro: 'Cannot rest password, try again' });
    }
})
router.post('/recuperar', async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send({ error: 'User not found' });
        } else {
            const token = crypto.randomBytes(20).toString('hex');
            const now = new Date();
            now.setHours(now.getHours() + 1);
            await User.findByIdAndUpdate(user.id, {
                '$set': {
                    passwordResetToken: token,
                    passwordResetExpires: now,
                }
            });
            console.log('ME OLHA', token, now);
            mailer.sendMail({
                to: "email@gmail.com",
                from: 'apocalipselopes@gmail.com',
                template: 'esqueci_senha',
                context: { token },
            }, (erro) => {
                if (erro) {
                    console.log('OLHA',erro)
                    return res.status(400).send({ error: 'can not send nada aqui'})
                } else {
                    return res.send();
                }
            })
        }
    }
    catch (erro) {
        console.log('AQUI', erro)
        res.status(400).send({ error: "Erro on forgot password, try again" });
    }
});


module.exports = (app) => app.use('/auth', router)
/*
const user = await User.findOne({ email });
if (!user) {
    return res.status(400).send({ error: 'User not found' });
} else {
const token = crypto.randomBytes(20).toString('hex');
const now = new Date();
now.setHours(now.getHours() + 1);
await User.findByIdAndUpdate(user.id, {
    '$set': {
        passwordResetToken: token,
        passwordResetExpires: now,
    }
})
}
*/
