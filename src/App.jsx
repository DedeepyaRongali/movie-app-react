import { useEffect, useState } from 'react';
import Search from './components/Search.jsx';
import Spinner from './components/Spinner.jsx';
import MovieCard from './components/MovieCard.jsx';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite.js';

const API_BASE_URL = "https://api.themoviedb.org/3"
const API_KEY= import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method:'GET',
  headers:{
    accept:"application/json",
    Authorization:`Bearer ${API_KEY}`
  }
}

const App = ()=>{
  const [searchTerm,setSearchTerm]=useState("");
  const [errorMessage,setErrorMessage] = useState("");
  const [movieList,setMovieList] = useState([]);
  const [isLoading,setIsLoading]=useState(false);
  const [isTrendingMoviesLoading,setIsTrendingMoviesLoading]=useState(false);
  const [debouncedSearchTerm,setDebouncedSearchTerm]=useState("");
  const[trendingMovies,setTrendingMovies]=useState([]);
  useDebounce(()=>setDebouncedSearchTerm(searchTerm),500,[searchTerm])
  const fetchMovies=async(query='')=>{
    setIsLoading(true);
    setErrorMessage("");
    try{
      const endpoint =query ?
      `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`:
      `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint,API_OPTIONS);
      if(!response.ok){
        throw new Error('Failed to fetch movies')
      }
      const data = await response.json();
      if(data.Response === 'False'){
        setErrorMessage(data.Error||"Failed to fetch movies");
        setMovieList([]);
        return
      }
      setMovieList(data.results || [])
      if(query&& data.results.length>0){
        await updateSearchCount(query,data.results[0])
      }
      updateSearchCount();
      console.log(data)
    }catch(e){
      console.log("Error fectching movies" +e)
    }finally{
      setIsLoading(false);
    }
  }
  const loadTrendingMovies=async()=>{
    try{
      setIsTrendingMoviesLoading(true)
      const movies = await getTrendingMovies();
      setTrendingMovies(movies)
    }catch(e){
console.error(e)
    }
    finally{
      setIsTrendingMoviesLoading(false);
    }
  }
  useEffect(()=>{
    fetchMovies(debouncedSearchTerm);
  },[debouncedSearchTerm])
  useEffect(()=>{
   loadTrendingMovies()
  },[])
  return(
    <main>
      <div className='pattern'></div>
      <div className='wrapper'>
        <header>
          <img src='./hero.png' alt="Hero Banner"/>
          <h1>Find <span className='text-gradient'>Movies</span>  You'll Enjoy Without the Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm ={setSearchTerm}/>
        </header>
        {trendingMovies.length>0 && (
          <section className='trending'>
            <h2>Trending Movies</h2>
            {isTrendingMoviesLoading?(
           <Spinner/>
          ):<ul>
              {trendingMovies.map((movie,index)=>{
                  return <li key={movie.$id}>
                  <p>{index+1}</p>
                  <img src={movie.poster_url}/>
                </li>   
                })}
            </ul>}
          </section>
        )}
        <section className = "all-movies">
          <h2 className='mt-[20px]'>All Movies</h2>
          {errorMessage && <p className='text-red-500'>{errorMessage}</p>}
          {isLoading?(
           <Spinner/>
          ):errorMessage?(
            <p className='text-red-500'>{errorMessage}</p>
          ):(
            <ul>
              {movieList.map((movie)=>(
               <MovieCard key={movie.id} movie={movie}></MovieCard>
              ))}
            </ul>
          )}
        </section>
      </div>
      </main>
    
  )
}
// const Card =({title})=>{
//   const [hasliked,setHasLiked]=useState(false)
//   const [count,setCount]=useState(0);
//   useEffect(()=>{
//     console.log(`${title} has been liked: ${hasliked}`)
//   },[hasliked]);
//   return (
//     <div className="card-component"  onClick={()=>{
//       setCount((prevState)=>prevState+1)
//     }}>
//       <h2>{title}-{count}</h2>
//       <div className='card-flex'>
//       <button onClick={()=>{
//         setHasLiked(!hasliked);
//       }}>
//         {hasliked?'❤️':'🤍'}
//       </button>
//       </div>
      
//     </div>
//   )
// }

export default App
