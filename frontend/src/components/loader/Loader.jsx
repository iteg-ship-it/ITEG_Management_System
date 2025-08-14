const Loader = ({ inline = false }) => {

    // If inline is true, don't add the fixed positioning
    if (inline) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-2">
                <div
                    className="w-12 h-12 rounded-full animate-spin-slow"
                    style={{
                        background: `conic-gradient(#f59e0b, #fbbf24, #fde68a, transparent 95%)`,
                        maskImage: "radial-gradient(circle, transparent 50%, black 51%)",
                        WebkitMaskImage: "radial-gradient(circle, transparent 50%, black 51%)",
                    }}
                ></div>
            </div>
        );
    }
    
    // Default centered loader with fixed position
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
            <div
                className="w-16 h-16 rounded-full animate-spin-slow"
                style={{
                    background: `conic-gradient(#f59e0b, #fbbf24, #fde68a, transparent 95%)`,
                    maskImage: "radial-gradient(circle, transparent 50%, black 51%)",
                    WebkitMaskImage: "radial-gradient(circle, transparent 50%, black 51%)",
                }}
            ></div>
        </div>
    );
};

export default Loader;