/* eslint-disable react/prop-types */
const GroupedHeadingComponent = ({
    subheadingText,
    headingText,
    mode = "dark",
    position = "center", 
    boxWidth = "medium", 
}) => {
    return (
        <div
            className={`${boxWidth === "large" ? "w-full" : "max-w-xl"} mx-auto ${
                position === "center" ? "text-center" : "text-left"
            } mb-8`}
        >
            <span
                className={`block ${
                    mode === "light" ? "text-gray-200" : "text-blue-600"
                } text-sm md:text-lg uppercase font-semibold tracking-wide`}
            >
                {subheadingText}
            </span>
            <h2
                className={`mt-2 ${
                    mode === "light" ? "text-gray-100" : "text-gray-800"
                } text-2xl md:text-4xl font-bold leading-snug`}
            >
                {headingText}
            </h2>
        </div>
    );
};

export default GroupedHeadingComponent;
