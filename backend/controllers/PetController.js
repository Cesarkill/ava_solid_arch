const pet = require('../models/Pet');
const jwt  = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const mongoose = require('mongoose');

const getToken = require('../helpers/get-Token');
const getUserByToken = require('../helpers/get-User-By-Token');
const { countDocuments } = require('../models/Pet');
const { use } = require('react');
const Pet = require('../models/Pet');

module.exports = class PetController {
    static async create(req, res) {
        const {name, age, weight, color} = req.body;
        
        if(!name) {
            res.status(422).json({message: 'O nome é obrigatório!'});
            return;
        }
        if(!age) {
            res.status(422).json({message: 'A idade é obrigatória!'});
            return;
        }
        if(!weight) {
            res.status(422).json({message: 'O peso é obrigatório!'});
            return;
        }
        if(!color) {
            res.status(422).json({message: 'A cor é obrigatória!'});
            return;
        }
        if (!req.files || req.files.length === 0) {
            res.status(422).json({ message: 'A imagem é obrigatória!' });
            return;
        }

        const images = req.files.map((file) => file.filename);

        const token = getToken(req);
        const user = await getUserByToken(token);

        const pet = new pet({
            name,
            age,
            weight,
            color,
            images,
            available: true,
            user: {
                _id: user._id,
                name: user.name,
                image: user.image,
                phone: user.phone,
            },
        });

        try {
            const newPet = await pet.save();
            res.status(201).json({
                message: 'Pet cadastrado com sucesso!',
                data : newPet,
            });
        } catch (error) {
            res.status(500).json({message: error});
        }
    }
    static async getAll(req, res) {

        const pets = await pet.find().sort('-createdAt');

        res.status(200).json({
            success: true,
            count : pets.length,
            data: pets,
        })

        return;
    }
    static async getAllUserPets(req, res) {
        const token = getToken(req);
        const user = await getUserByToken(token);

        const pets = await pet.find({'user._id': user._id}).sort('-createdAt');

        res.status(200).json({
            success: true,
            count : pets.length,
            data: pets,
        });
        return;
    }
    static async getAllUsersadoptions(req, res) {
        const token = getToken(req);
        const user = await getUserByToken(token);

        const pets = await pet.find({'adopter._id': user._id}).sort('-createdAt');

        res.status(200).json({
            success: true,
            count : pets.length,
            data: pets,
        });
        return;
    }
    static async getPetById(req, res) {
        res.status(200).json({message: 'em construçãoo'});
        return;
    }
    static async removePetbyid(req, res) {
        res.status(200).json({message: 'em construçãoo'});
        return;
    }
    static async updatePet(req, res) {
        res.status(200).json({message: 'em construçãoo'});
        return;
    }
    static async schedule(req, res) {
        res.status(200).json({message: 'em construçãoo'});
        return;
    }
    static async concludeAdoption(req, res) {
        res.status(200).json({message: 'em construçãoo'});
        return;
    }
    static async getPetById(req, res) {
        const id = req.params.id;

        if (!mongoose.types.objectId.isValid(id)) {
            res.status(422).json({ message: 'ID inválido!' });
            return;
        }
        try {
            const pet = await pet.findById(id);
            if (!pet) {
                res.status(404).json({ message: 'Pet não encontrado!' });
                return;
            }
            res.status(200).json({ success: true, data: pet });
        } catch (error) {
            res.status(500).json({ message: error });
        }

        if (!pet) {
            res.status(404).json({ message: 'Pet não encontrado!' });
            return;
        }
        res.status(200).json({data: pet });
    }
    static async removePetbyid(req, res) {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(422).json({ message: 'ID inválido!' });
            return;
        }

        const pet = await pet.findById(id);
        if (!pet) {
            res.status(404).json({ message: 'Pet não encontrado!' });
            return;
        }

        const token = getToken(req);
        const user = await getUserByToken(token);
        if (pet.user._id.toString() !== user._id.toString()) {
            res.status(403).json({ message: 'Apenas o dono do pet pode removê-lo!' });
            return;
        }
        await pet.findByIdAndDelete(id);
        res.status(200).json({ message: 'Pet removido com sucesso!', data: pet });
    }
    static async schedule(req, res) {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(422).json({ message: 'ID inválido!' });
            return;
        }
        const pet = await pet.findById(id);

        if (!pet) {
            res.status(404).json({ message: 'Pet não encontrado!' });
            return;
        }
        const token = getToken(req);
        const user = await getUserByToken(token);

        if (pet.user._id.toString() === user._id.toString()) {
            res.status(403).json({ message: 'Você não pode agendar uma visita com seu próprio pet!' });
            return;
        }

        pet.adopter = {
            _id: user._id,
            name: user.name,
            image: user.image,
            phone: user.phone,
        };

        try {
            await Pet.findByIdAndUpdate(id, pet);
            res.status(200).json({ message: 'Visita agendada com sucesso!' });
        }catch (error) {
            res.status(503).json({ message: error });
        }
    }
    static async concludeAdoption(req, res) {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(422).json({ message: 'ID inválido!' });
            return;
        }

        const pet = await pet.findById(id);

        if (!pet) {
            res.status(404).json({ message: 'Pet não encontrado!' });
            return;
        }
         const token = getToken(req);
        const user = await getUserByToken(token);

        if (pet.user._id.toString() !== user._id.toString()) {
            res.status(403).json({ message: 'Apenas o dono do pet pode concluir a adoção!' });
            return;
        }
        pet.available = false;
        
        try {
            await Pet.findByIdAndUpdate(id, pet);
            return res.status(200).json({ message: 'A adoção foi concluída com sucesso!' });
        }catch (error) {
            res.status(503).json({ message: error });
        }
    }
    }

