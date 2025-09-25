import NewTopicForm from "@/components/NewTopicForm";
import TopicList from "@/components/TopicList";
import { getTopicsServer } from "@/app/action/getTopic.action";

export default async function Home() {
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Topics</h1>

      <NewTopicForm />

      <TopicList initialData={await getTopicsServer()} />
    </main>
  );
}
