import { useEffect, useState } from "react";
import "./App.css";
import { Auth } from "./components/Auth";
import { auth, db, storage } from "./config/firebase";
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";

interface Movie {
  hasOscar: boolean;
  releaseDate: number;
  title: string;
  id: string;
}

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);

  // New movie states
  const [newMovieTitle, setNewMovieTitle] = useState("");
  const [newReleaseDate, setNewReleaseDate] = useState(0);
  const [isNewMovieOscar, setNewMovieOscar] = useState(false);
  const [fileUpload, setFileUpload] = useState<File | null>(null);

  const [updatedTitle, setUpdatedTitle] = useState("");

  const movieCollectionRef = collection(db, "movies");

  const onUploadFile = async () => {
    if (fileUpload == null) return;

    const fileFolderRef = ref(storage, `projectFiles/${fileUpload.name}`);
    
    try {
      await uploadBytes(fileFolderRef, fileUpload);
      console.log("File uploaded")
    } catch (error) {
      console.error(error)
    }
  };

  const getMovieList = async () => {
    try {
      const movieListRaw = await getDocs(movieCollectionRef);
      const movieList = movieListRaw.docs.map<Movie>(
        (doc) => ({ ...doc.data(), id: doc.id } as Movie)
      );
      setMovies(movieList);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getMovieList();
  }, []);

  const onSubmitMovie: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      await addDoc(movieCollectionRef, {
        title: newMovieTitle,
        hasOscar: isNewMovieOscar,
        releaseDate: newReleaseDate,
        userId: auth?.currentUser?.uid ?? null,
      });

      getMovieList();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteMovie = async (id: string) => {
    try {
      const movie = doc(db, "movies", id);
      await deleteDoc(movie);
      getMovieList();
    } catch (error) {
      console.error(error);
    }
  };

  const updateMovieTitle = async (id: string) => {
    try {
      const movie = doc(db, "movies", id);
      await updateDoc(movie, {
        title: updatedTitle,
      });
      getMovieList();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Auth />

      <form onSubmit={onSubmitMovie}>
        <input
          placeholder="Movie title..."
          onChange={(e) => setNewMovieTitle(e.target.value)}
        />
        <input
          placeholder="Release date..."
          type="number"
          onChange={(e) => setNewReleaseDate(Number(e.target.value))}
        />
        <input
          type="checkbox"
          id="oscar"
          name="oscar"
          checked={isNewMovieOscar}
          onChange={(e) => setNewMovieOscar(e.target.checked)}
        />
        <label htmlFor="oscar">Received Oscar</label>
        <button>Submit Movie</button>
      </form>
      <div>
        {movies.map((movie) => (
          <div>
            <h1 style={{ color: movie.hasOscar ? "green" : "red" }}>
              {movie.title}
            </h1>
            <p>Date: {movie.releaseDate}</p>
            <button onClick={() => deleteMovie(movie.id)}>Delete</button>

            <input
              placeholder="new title..."
              value={updatedTitle}
              onChange={(e) => setUpdatedTitle(e.target.value)}
            />
            <button onClick={() => updateMovieTitle(movie.id)}>
              Update Title
            </button>
            <div>
              <input
                type="file"
                onChange={(e) => setFileUpload(e.target.files?.[0] ?? null)}
              />
              <button onClick={onUploadFile}>Upload File</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
