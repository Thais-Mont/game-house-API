import express from "express"
import cors from "cors"
import { PrismaClient } from '@prisma/client'
import {convertHourStringToMinutes} from './utils/convert-hour-string-to-minutes';
import {convertMinutesToHoursString} from './utils/convert-minutes-to-hours';

const app = express()

app.use(express.json());

app.use(cors());

const prisma = new PrismaClient({
  log: ['query']
})

//async await
app.get('/games', async (req:any, res:any) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true,
        }
      }
    }
  })
  return res.json(games);
});

//Criando novo jogo
app.post('/games/new-game', async (req:any, res:any) => {
  const body = req.body;

  const game = await prisma.game.create({
    data: {
      title: body.title,
      bannerUrl: body.bannerUrl,
      genero: body.genero
    }
  });
  return res.status(201).json(body);
});

//deletar jogo
app.delete('/games/:id', async (req:any, res:any) => {
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
      genero: body.genero
    }
  });
  res.json(game)
});


//Criando anúncios
app.post('/games/:id/ads', async (req:any, res:any) => {
  const gameId = req.params.id;
  const body = req.body;

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      yearsPlaying: body.yearsPlaying ,
      discord: body.discord,
      weekDays: body.weekDays.join(','),
      hourStart: convertHourStringToMinutes(body.hourStart),
      hourEnd: convertHourStringToMinutes(body.hourEnd),
      useVoiceChannerl: body.useVoiceChannerl,
    }
  });
  return res.status(201).json(body);
});

app.get('/games/:id/ads', async (req:any, res:any) => {
  const gameId = req.params.id;
  const ads = await prisma.ad.findMany({
    select:{
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannerl: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true,
    },
    where: {
      gameId: gameId,
    },
    orderBy: {
      createdAt: 'desc',
    }
  })
  return res.json(ads.map((ad: {
    hourStart: number; weekDays: string; 
}) => {
    return {
      ...ad,
      weekDays: ad.weekDays.split(','),
      hourStart: convertMinutesToHoursString(ad.hourStart),
    }
    }));
})

app.get('/ads/:id/discord', async (req:any, res:any) => {
  const adId = req.params.id;

  const ad = await prisma.ad.findUniqueOrThrow({
    select: {
      discord: true,
    },
    where: {
      id: adId ,
    }
  })
  return res.json({
    discord: ad.discord,
  })
})


//localhost:3333/ads
app.listen(3333)
