export async function seedAuthSession(page) {
  await page.addInitScript(() => {
    localStorage.setItem('velto_cloud_session', JSON.stringify({
      token: 'e2e_test_token',
      user: {
        id: 'owner_andra',
        email: 'andrasyahdand@gmail.com',
        name: 'Andra Syahdan Daud',
        role: 'owner'
      }
    }));
  });
}
