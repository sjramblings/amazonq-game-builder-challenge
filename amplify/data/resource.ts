import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/*== TETRIS GAME SCHEMA ===============================================
This schema defines the data models for our Tetris game:
- Score: Stores user scores with authentication
=====================================================================*/
const schema = a.schema({
  Score: a
    .model({
      playerName: a.string().required(),
      score: a.integer().required(),
      level: a.integer().required(),
      linesCleared: a.integer().required(),
      gameDate: a.datetime().required(),
      userId: a.string(), // Optional: for authenticated users
    })
    .authorization((allow) => [
      // Allow public access for creating and reading scores
      allow.publicApiKey().to(['create', 'read']),
      // Allow authenticated users full access
      allow.authenticated().to(['create', 'read']),
      // Allow guest users to create and read
      allow.guest().to(['create', 'read'])
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 365,
    },
  },
});

/*== TETRIS SCORE API USAGE ==========================================
From your client-side code, generate a Data client to make CRUDL 
requests to your Score table:

"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>()

// Create a new score
await client.models.Score.create({
  playerName: "Player1",
  score: 15000,
  level: 5,
  linesCleared: 50,
  gameDate: new Date().toISOString(),
  userId: "user123"
});

// List all scores
const { data: scores } = await client.models.Score.list()
=========================================================================*/
