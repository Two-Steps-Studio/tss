type CircularProgressProps = {
    percentage: number;
};

export default function CircularProgress({ percentage = 0 }: CircularProgressProps) {
    const primaryColor = "#1bbdbd";

    return (
        <div className="w-40 h-40 flex items-center justify-center my-10">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Tło */}
                <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                />
                {/* Progress */}
                <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={primaryColor}
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * percentage) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                />
                {/* Tekst */}
                <text
                    x="50"
                    y="50"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={primaryColor}
                    fontSize="14"
                    fontWeight="600"
                    className="select-none"
                >
                    {percentage}%
                </text>
            </svg>
        </div>
    );
}