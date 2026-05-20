import PropTypes from "prop-types";

function FotoProfile({ src, alt, name }) {
  if (!src) {
    return (
      <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-zinc-700 bg-gradient-to-br from-amber-500 to-blue-600 text-lg font-bold text-white">
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-12 w-12 rounded-full border-2 border-zinc-700 object-cover"
    />
  );
}

FotoProfile.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  name: PropTypes.string,
};

export default FotoProfile;