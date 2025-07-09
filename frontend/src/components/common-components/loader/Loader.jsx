const Loader = () => {
  
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10">
        
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
  };
  
  export default Loader;
  