import SingleTask from "@/components/Projects/board/single-task";

export type Board = {
    name: string;
    createdAt: Date;
    tasks: Task[];
};

type Props = {
    board: Board;
};

export default function SingleBoard({ board }: Props) {
    const { name: boardName, tasks } = board;
    const numberTasks = tasks.length;

    return (
        <div className="w-full min-w-[300px] h-full border p-4 rounded-2xl">
            <div className="flex justify-between p-4 rounded-xl items-center mb-4">
                <span className="font-medium text-md">{boardName}</span>

                <div className="size-6 rounded-full bg-primary text-white flex items-center justify-center">
                    <span className="text-sm mt-[2px]">{numberTasks}</span>
                </div>
            </div>

            <div className="mt-2 flex flex-col gap-3">
                {tasks.map((task) => (
                    <SingleTask key={task.id} task={task} />
                ))}
            </div>
        </div>
    );
}