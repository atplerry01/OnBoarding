export default async (jsonFile) => fetch(`${process.env.PUBLIC_URL}/json-data/${jsonFile}`)
  .then((res) => res.json())
  .catch((error) => {
    console.log(error);
  });
