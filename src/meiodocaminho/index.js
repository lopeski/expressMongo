const jwt = require('jsonwebtoken');
const secredo = require('../Config/auth.json');

module.exports = (req, res, next) => {
    const autoHe = req.headers.authorization;

    if (!autoHe) {
        return res.status(401).send({ error: 'Token nao informado'});
    } else{
        const parts = autoHe.split(' ');
        if (!parts.lenght === 2) {
            return res.status(401).send({ error: 'Token error' });
        } else {
            const [ scheme, token ] = parts;
            if (!/^Bearer$/i.test(scheme)){
                return res.status(401).send({ error: 'Token malformatado'});
            } else {
                jwt.verify(token, secredo.secret, (err, decoded) => {
                    if (err) {
                        return res.status(401).send({ error: 'Token invalid' });
                    } else {
                        req.userId = decoded.params;
                        return next();                
                    }
                })
            }
        }
    }





}
