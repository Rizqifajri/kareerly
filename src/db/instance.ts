import PocketBase from 'pocketbase';

export const client = new PocketBase(process.env.NEXT_PUBLIC_BASE_URL_POCKETBASE);

client.autoCancellation(false);