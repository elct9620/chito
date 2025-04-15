import { Hono } from 'hono';

export const route = new Hono().
	get('/', async (c) => {
		return c.text('Chito Assistant');
	})
