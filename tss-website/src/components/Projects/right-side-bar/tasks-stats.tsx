import { Separator } from "@/components/ui/separator";

type TaskCard = {
    label: string;
    value: number;
};

export default function TasksStats({ tasks }: { tasks: any[] }) {
    const statisticCards: TaskCard[] = [
        { label: "total", value: tasks.length },
        { label: "in progress", value: tasks.filter(t => t.status === "in-progress").length },
        { label: "waiting", value: tasks.filter(t => t.status === "todo").length },
        { label: "completed", value: tasks.filter(t => t.status === "completed").length },
    ];

    return (
        <div className="flex flex-col gap-2">
            <span className="font-bold text-xl">Tasks</span>

            <div className="grid grid-cols-2 gap-3 mt-3">
                {statisticCards.map((statcard, index) => (
                    <SingleCard key={index} statcard={statcard} />
                ))}
            </div>
        </div>
    );
}

function SingleCard({ statcard }: { statcard: TaskCard }) {
    return (
        <div className="p-3 bg-gray-100 rounded-xl">
            <span className="text-gray-600 text-[12px]">
                {statcard.label.toUpperCase()}
            </span>

            <div className="flex gap-2 mt-1 items-center">
                <Separator className="w-1 h-4 bg-primary" orientation="vertical" />
                <span className="font-bold text-lg">
                    {statcard.value}
                </span>
            </div>
        </div>
    );
}
