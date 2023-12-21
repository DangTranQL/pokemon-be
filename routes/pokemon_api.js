const fs= require("fs")
const express = require('express')
const router = express.Router()
const crypto=require('crypto')

const pokemonTypes = [
    "bug", "dragon", "fairy", "fire", "ghost", 
    "ground", "normal", "psychic", "steel", "dark", 
    "electric", "fighting", "flyingText", "grass", "ice", 
    "poison", "rock", "water"
]

//getting all pokemons, search by type, name
router.get('/', async (req,res,next)=>{
    const allowedFilter = [
        "types",
        "name",
        "page",
        "limit",
    ];
    try {
        let { page, limit, ...filterQuery } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 20;
        //allow title,limit and page query string only
        const filterKeys = Object.keys(filterQuery);
        filterKeys.forEach((key) => {
        if (!allowedFilter.includes(key)) {
            const exception = new Error(`Query ${key} is not allowed`);
            exception.statusCode = 401;
            throw exception;
        }
        if (!filterQuery[key]) delete filterQuery[key];
        });
        //processing logic
        //Number of items skip for selection
        let offset = limit * (page - 1);

        //Read data from db.json then parse to JSobject
        let db = fs.readFileSync("db.json", "utf-8");
        db = JSON.parse(db);
        let {data} = db;
        //Filter data by title
        let result = [];

        if (filterKeys.length) {
        filterKeys.forEach((condition) => {
            result = result.length
            ? result.filter((pokemon) => pokemon[condition].includes(filterQuery[condition]))
            : data.filter((pokemon) => pokemon[condition].includes(filterQuery[condition]));
        });
        data = result;
        }
        else{
        data = data;
        }
        //then select number of result by offset
        data = data.slice(offset, offset + limit);
        //send response
        res.status(200).send({data, totalPokemons: 721})
    } catch (error) {
        next(error);
    }
})

router.get('/:id',(req,res,next)=>{
    try {
        const {id}=req.params;
        const pokemonId = parseInt(id)
        let db=fs.readFileSync("db.json","utf-8");
        db=JSON.parse(db);
        const pokemons=db.data;
        const pokemon=pokemons.find(pokemon=>pokemon.id==pokemonId);
        let prev_pokemon;
        let next_pokemon;

        if(!pokemon){
            const error=new Error(`Pokemon with id ${id} not found`)
            error.statusCode=404
            throw error
        }
        else{
            if (pokemon.id===1) {
                prev_pokemon=pokemons.find(pokemon=>pokemon.id===721)
                next_pokemon=pokemons.find(pokemon=>pokemon.id===2)
            }
            else if(pokemon.id===721){
                prev_pokemon=pokemons.find(pokemon=>pokemon.id===720)
                next_pokemon=pokemons.find(pokemon=>pokemon.id===1)
            }
            else{
                prev_pokemon=pokemons.find(pokemon=>pokemon.id===pokemonId-1)
                next_pokemon=pokemons.find(pokemon=>pokemon.id===pokemonId+1)
            }
            res.status(200).send({pokemon, previousPokemon: prev_pokemon, nextPokemon: next_pokemon})
        }
    } catch (error) {
        next(error);
    }
})

router.post('/',(req,res,next)=>{
    //post input validation
    try{
        const { name, types, url } = req.body;
    if(!name || !types || !url){
        const exception = new Error(`Missing body info`);
        exception.statusCode = 401;
        throw exception;
    }
    else if (pokemonTypes.includes(types)){
        const exception = new Error(`Invalid types`);
        exception.statusCode = 401;
        throw exception;
    }
    //post processing
    const newPokemon = {name, types, url, pages: parseInt(pages) || 1, id: crypto.randomBytes(4).toString("hex")};
    //Read data from db.json then parse to JSobject
    let db = fs.readFileSync("db.json", "utf-8");
    db = JSON.parse(db);
    let {data} = db;

    //Add new book to book JS object
    data.push(newPokemon)
    //Add new book to db JS object
    db.data=data
    //db JSobject to JSON string
    db= JSON.stringify(db)
    //write and save to db.json
    fs.writeFileSync("db.json",db)
    //post send response
    res.status(200).send(newPokemon)
    }catch(error){
        next(error)
    }
})

module.exports=router