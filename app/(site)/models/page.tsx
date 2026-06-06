import { fetchTopModels } from "@/lib/hf-models";
import ModelsClient from "./ModelsClient";

export const revalidate = 86400;

export default async function ModelsPage() {
  const models = await fetchTopModels();
  return <ModelsClient models={models} />;
}
