/**
 * @author Harsh Kamleshbhai Shah <shah.harsh@default.ca>
 */
import { SessionManager } from "@/common/SessionManager";
import MovieMagementService from "@/services/MovieManagementService/MovieManagementService";
import { WatchlistState } from "@/services/WatchlistManagementService/WatchlistEnum";
import WatchlistService from "@/services/WatchlistManagementService/WatchlistService";
import { DeleteIcon, MinusIcon, ViewIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Card,
  CardHeader,
  Flex,
  Heading,
  HStack,
  Image,
  SimpleGrid,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Watchlist = () => {
  const userId: any = SessionManager.getUserID();
  const watchlistService = new WatchlistService();
  const isLoggedIn = SessionManager.isLoggedIn();
  const movieManager = new MovieMagementService();

  const toast = useToast();

  const [list, setList] = useState([] as any);

  const navigate = useNavigate();

  const setWatchListMovies = async (watchlist: any) => {
    let l: any = [];
    await Promise.all(
      watchlist.map(async (item: any) => {
        const movieId = item.movieId;
        const movie = await movieManager.fetchMovieByID(movieId);
        l.push(movie);
      })
    );
    return l;
  };

  const getWatchlist = async () => {
    const watchlist = await watchlistService.getWatchlist(userId);
    const x = await setWatchListMovies(watchlist);
    setList(x);
  };

  const fetchData = async () => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      await getWatchlist();
    }
  };

  useEffect(() => {
    fetchData();
  }, [isLoggedIn]);

  const navigateToMoviePage = (e: any) => {
    e.preventDefault();
    if (e.target.id) {
      navigate("/movie-details/" + e.target.id);
    }
  };

  const handleRemove = async (id: any) => {
    // setList(list.filter((movie) => movie.id !== id));
    const response = await watchlistService.removeFromWatchlist(userId, id);
    fetchData();
    if (response == WatchlistState.RemoveMovieSuccess) {
      toast({
        title: "Movie Removed",
        description: "Successfully removed from watchlist",
        duration: 1000,
        isClosable: true,
        status: "error",
        position: "top",
        icon: <DeleteIcon />,
      });
    }
    else{
      alert("System Error! Please try again");
    }
  };

  return (
    <Box
      p={5}
      boxShadow="md"
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
    >
      <Heading p="7" as="h3" size="xl" color="orange">
        My Watchlist
      </Heading>
      <br></br>
      <SimpleGrid>
        {list.map((movie: any) => (
          <>
            <Card
              key={movie._id}
              rounded="lg"
              width="100%"
              alignItems="start"
              justifyContent={"start"}
            >
              <CardHeader w={"100%"}>
                <Flex>
                  <Image
                    src={movie.poster}
                    alt={movie.title}
                    objectFit="cover"
                    maxH="200"
                    maxW="120"
                  />
                  <VStack
                    w="100%"
                    ml="15px"
                    alignItems="left"
                    justifyContent="space-between"
                  >
                    <VStack alignItems="left">
                      <Text textAlign="left" fontSize={20} fontWeight="bold">
                        {movie.title}
                      </Text>
                      <Text noOfLines={[1, 2]} fontSize={13}>
                        {movie.plot}
                      </Text>
                    </VStack>
                    <HStack w={"100%"} justifyContent="flex-end">
                      <Button
                        id={movie._id}
                        onClick={navigateToMoviePage}
                        leftIcon={<ViewIcon />}
                      >
                        View
                      </Button>
                      <Button
                        onClick={() => handleRemove(movie._id)}
                        color="red.500"
                        leftIcon={<MinusIcon />}
                      >
                        Remove
                      </Button>
                    </HStack>
                  </VStack>
                </Flex>
              </CardHeader>
            </Card>
            <br></br>
          </>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Watchlist;
