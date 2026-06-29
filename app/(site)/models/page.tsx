import { fetchTopModels } from "@/lib/hf-models";
import ModelsClient from "./ModelsClient";

export const revalidate = 21600;

export default async function ModelsPage() {
  const models = await fetchTopModels();
  return <ModelsClient models={models} />;
}
