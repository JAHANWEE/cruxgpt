import { search } from 'duck-duck-scrape';
async function run() {
  try {
    const res = await search('weather in tokyo');
    console.log(res);
  } catch (e) {
    console.error(e);
  }
}
run();
