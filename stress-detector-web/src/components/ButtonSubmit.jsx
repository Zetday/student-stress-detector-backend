function ButtonSubmit({children}){
    return (
        <button className="
            w-full
            bg-blue-600 hover:bg-blue-800 
            text-white 
            py-3 
            rounded-lg 
            font-medium 
            transition 
            text-2xl">
            {children}
          </button>
    );
}

export default ButtonSubmit;
