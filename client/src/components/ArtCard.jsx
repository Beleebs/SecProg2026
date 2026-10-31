// art card
// shows the image, the title, description, and artist
import { useEffect, useState } from "react";

function ArtCard({artData}) {
    const [imageLink, setImageLink] = useState("");
    const [imageError, setImageError] = useState("");

    useEffect(() => {
        let objectURL;

        async function loadImage() {
            try {
                const token = localStorage.getItem("token");
                const body = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ image: artData.image_path })
                }
                const response = await fetch("/api/fetch-image", body);
                
                if (!response.ok) {
                    const result = await response.json();
                    throw new Error(result.error || "Could not fetch image");
                }

                objectURL = URL.createObjectURL(await response.blob());
                setImageLink(objectURL);

            } catch (error) {
                setImageError(error.message);
            }
        }

        loadImage();
        return () => {
            if (objectURL) URL.revokeObjectURL(objectURL);
        };

    }, [artData.image_path]);

    return (
        <div>
            {imageLink && <img src={imageLink} alt={artData.art_name} />}
            {imageError && <p role="alert">{imageError}</p>}
            <h2>{artData.art_name}</h2>
            <p>By {artData.artist}</p>
            {artData.art_description && <p>{artData.art_description}</p>}
        </div>
    );
}

export default ArtCard;