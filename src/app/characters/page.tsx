import { CharactersView } from "@/features/characters";
import { listCharacters, listServers } from "@/shared/api/studio/loadStudio";

export default async function Page() {
  const [characters, servers] = await Promise.all([
    listCharacters(),
    listServers(),
  ]);
  return <CharactersView characters={characters} servers={servers} />;
}
