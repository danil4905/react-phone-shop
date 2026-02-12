let catalogList = []
const getCatalog = async () => {
  try {
     const res = await fetch('/api/phones')
     catalogList = res.json()
  } catch(error) {
    console.error(error)
  }
}
export default function Home() {
  return (
    <main>
      <ul>
        
      </ul>
    </main>
  );
}
