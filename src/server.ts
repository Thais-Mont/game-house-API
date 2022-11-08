import express from "express"
import cors from "cors"
import { PrismaClient, Profile } from '@prisma/client'
import {convertHourStringToMinutes} from './utils/convert-hour-string-to-minutes';
import {convertMinutesToHoursString} from './utils/convert-minutes-to-hours';

const app = express();
const port = 3333;

app.use(express.json());

app.use(cors());

const prisma = new PrismaClient({
  log: ['query']
})

//async await
app.get('/games', async (req:any, res:any) => {
  const games = await prisma.game.findMany()
  return res.json(games);
});

//buscando um único jogo por id
app.get('/games/:id', async (req:any, res:any) => {
  const id = req.params.id;
  const game = await prisma.game.findUnique({
    where: {id: id},
  });
  return res.json(game);
})

//Criando novo jogo
app.post('/games/new-game', async (req:any, res:any) => {
  const body = req.body;

  const game = await prisma.game.create({
    data: {
      title: body.title,
      bannerUrl: body.bannerUrl,
      genero: body.genero,
      descricao: body.descricao,
      videoUrl: body.videoUrl,
    }
  });
  return res.status(201).json(game);
});

//deletar jogo
app.delete('/game/:id', async (req:any, res:any) => {
  const id = req.params.id;
  const game = await prisma.game.delete({
    where: { id: id },
  });
  return res.json(game);
});

//atualizar um jogo
app.post('/games/:id', async (req:any, res:any) => {
  const id = req.params.id;
  const body = req.body;
  const game = await prisma.game.update({
    where: {id: id},
    data: {
      title: body.title,
      bannerUrl: body.bannerUrl,
      genero: body.genero,
      descricao: body.descricao,
      videoUrl: body.videoUrl
    }
  });
  res.json(game)
});

//Buscar usuários
app.get('/user', async (req:any, res:any) => {
  const user = await prisma.user.findMany({});
  return res.status(201).json(user);
});

//User login
app.post('/user/login', async (req:any, res:any) => {
  const body = req.body;
  const users = await prisma.user.findMany({
    where: {
      email: body.login,
      senha: body.senha
  },
  });
  if(users.length > 0){
    return res.status(200).json(users[0]);
  }
  return res.status(404).send();
});

//Criando usuários
app.post('/user/new-user', async (req:any, res:any) => {
  const body = req.body;
  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      senha: body.senha,
      cpf: body.cpf
    }
  });
  return res.status(201).json(user);
});

//deletar usuario
app.delete('/user/:id', async (req:any, res:any) => {
  const id = req.params.id;
  const user = await prisma.user.delete({
    where: { id: id },
  });
  return res.json(user);
});

//atualizar usuário
app.post('/user/:id', async (req:any, res:any) => {
  const id = req.params.id;
  const body = req.body;
  const user = await prisma.user.update({
    where: {id: id},
    data: {
      name: body.name,
      email: body.email,
      senha: body.senha,
      cpf: body.cpf
    }
  });
  res.json(user)
});

//Criando Profiles
app.post('/profile/new-profile', async (req:any, res:any) => {
  const body = req.body;
  const profile = await prisma.profile.create({
    data: {
      userId: body.userId,
      title: body.title,
      imageURL : body.imageURL,
    }
  });
  return res.status(201).json(profile);
});

//deletar profile
app.delete('/profile/:id', async (req:any, res:any) => {
  const id = req.params.id;
  const profile = await prisma.profile.delete({
    where: { id: id },
  });
  return res.json(profile);
});

//atualizar profile
app.post('/profile/:id', async (req:any, res:any) => {
  const id = req.params.id;
  const body = req.body;
  const profile = await prisma.profile.update({
    where: {id: id},
    data: {
      title: body.name,
      imageURL : body.email,
    }
  });
  res.json(profile)
});

//buscar todos profiles
app.get('/user/:id/profile', async (req:any, res:any) => {
  const userId = req.params.id;
  const profile = await prisma.profile.findMany({
    where: { userId: userId },
  });
  return res.json(profile);
});

//adicionando favorito
app.post('/profile/:id/favorito', async (req:any, res:any) => {
  const id = req.params.id; 
  const body = req.body;
  console.log(body.gameId + "  -  " + id)
  try {
    const retorno = await prisma.favourites.create({
      data: {
        gameId: body.gameId,
        profileId: id
      }
    });
    return res.json(retorno);
  } catch (err) {
    return res.status(404).send()
  }
});

// buscar favoritos de um profile
app.get('/profile/:id/favoritos', async (req: any, res: any) => {
  const id = req.params.id;
  const profile: any = await prisma.profile.findUnique({
    where: { id: id },
    select: {
    favoritos: { 
      select: { 
        gameId: true,
      }
    }
  }
  });
  const favoritos = profile.favoritos.map((item: any) => {
    return item.gameId;
  })
  return res.json(favoritos);
});


//buscar todos favoritos
app.get('/user/:id/favoritos', async (req:any, res:any) => {
  const userId = req.params.id;
  const profile = await prisma.profile.findMany({
    where: { userId: userId },
  });
  return res.json(profile);
});












//localhost:3333/ads
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
