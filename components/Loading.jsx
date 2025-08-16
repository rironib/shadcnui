const Loading = () => {
    return (
        <div
            className="fixed bottom-0 left-0 right-0 top-0 z-20 flex h-[100dvh] items-center justify-center bg-background">
            <div className="spinner"></div>
        </div>
    );
};

export default Loading;