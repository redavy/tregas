import fetch from 'node-fetch';

export async function getPlayerStats(tag) {
  try {
    const url = `https://api.brawlstars.com/v1/players/%23${tag.replace('#', '')}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${process.env.BRAWL_API_KEY}` },
      timeout: 10000
    });
    return await response.json();
  } catch (e) {
    console.error(`Ошибка при запросе игрока ${tag}:`, e);
    return null;
  }
}

export async function getClubStats() {
  try {
    const url = `https://api.brawlstars.com/v1/clubs/%23${process.env.CLUB_TAG.replace('#', '')}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${process.env.BRAWL_API_KEY}` },
      timeout: 10000
    });
    return await response.json();
  } catch (e) {
    console.error('Ошибка при запросе клуба:', e);
    return null;
  }
}
