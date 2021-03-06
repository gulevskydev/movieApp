import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import styled from "styled-components";
import queryString from "query-string";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import history from "../history";
import LazyLoad from "react-lazyload";
import ModalVideo from "react-modal-video";
import { Element, animateScroll as scroll } from "react-scroll";

import {
  getMovie,
  getMoviesRecommendations,
} from "../store/actions/actionCreators";

import {
  Rating,
  Title,
  Movies,
  Button,
  Credits,
  NotFound,
  Loader,
} from "../components/index";
import noImage from "../img/noimage.svg";

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
`;

const MovieWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 120rem;
  margin: 0 auto;
  margin-bottom: 7rem;
  transition: all 600ms cubic-bezier(0.215, 0.61, 0.355, 1);
  @media ${(props) => props.theme.mediaQueries.largest} {
    max-width: 105rem;
  }
  @media ${(props) => props.theme.mediaQueries.larger} {
    max-width: 110rem;
    margin-bottom: 6rem;
  }
  @media ${(props) => props.theme.mediaQueries.large} {
    max-width: 110rem;
    margin-bottom: 5rem;
  }
  @media ${(props) => props.theme.mediaQueries.medium} {
    flex-direction: column;
    margin-bottom: 5rem;
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  display: block;
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1;
  color: var(--color-primary-light);
  text-transform: uppercase;
  padding: 0.5rem 0rem;
  transition: all 300ms cubic-bezier(0.075, 0.82, 0.165, 1);
  &:not(:last-child) {
    margin-right: 2rem;
  }
  &:hover {
    transform: translateY(-3px);
  }
  &:active {
    transform: translateY(2px);
  }
`;

const LinksWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
`;

const MovieDetails = styled.div`
  width: 100%;
  max-width: 60%;
  padding: 4rem;
  flex: 1 1 60%;
  @media ${(props) => props.theme.mediaQueries.largest} {
    padding: 3rem;
  }
  @media ${(props) => props.theme.mediaQueries.large} {
    padding: 2rem;
  }
  @media ${(props) => props.theme.mediaQueries.smaller} {
    padding: 1rem;
  }
  @media ${(props) => props.theme.mediaQueries.smallest} {
    padding: 0rem;
  }
  @media ${(props) => props.theme.mediaQueries.medium} {
    max-width: 100%;
    flex: 1 1 100%;
  }
`;

const ImageWrapper = styled.div`
  width: 100%;
  max-width: 40%;
  flex: 1 1 40%;
  align-items: center;
  justify-content: center;
  display: flex;
  padding: 4rem;
  @media ${(props) => props.theme.mediaQueries.largest} {
    padding: 3rem;
  }
  @media ${(props) => props.theme.mediaQueries.large} {
    padding: 2rem;
  }
  @media ${(props) => props.theme.mediaQueries.smaller} {
    margin-bottom: 2rem;
  }
  @media ${(props) => props.theme.mediaQueries.medium} {
    max-width: 60%;
    flex: 1 1 60%;
  }
`;

const MovieImg = styled.img`
  max-height: 100%;
  height: ${(props) => (props.error ? "25rem" : "auto")};
  object-fit: ${(props) => (props.error ? "contain" : "cover")};
  padding: ${(props) => (props.error ? "2rem" : "")};
  max-width: 100%;
  border-radius: 0.8rem;
  box-shadow: ${(props) =>
    props.error ? "none" : "0rem 2rem 5rem var(--shadow-color-dark)"};
`;

const ImgLoading = styled.div`
  width: 100%;
  max-width: 40%;
  flex: 1 1 40%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  transition: all 100ms cubic-bezier(0.645, 0.045, 0.355, 1);
  @media ${(props) => props.theme.mediaQueries.smaller} {
    height: 28rem;
  }
`;

const HeaderWrapper = styled.div`
  margin-bottom: 2rem;
`;

const Heading = styled.h3`
  color: var(--color-primary-dark);
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 1rem;
  font-size: 1.4rem;
  @media ${(props) => props.theme.mediaQueries.medium} {
    font-size: 1.2rem;
  }
`;

const DetailsWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5rem;
`;

const RatingsWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: auto;
`;

const RatingNumber = styled.p`
  font-size: 1.3rem;
  line-height: 1;
  font-weight: 700;
  color: var(--color-primary);
`;

const Info = styled.div`
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
  color: var(--color-primary-lighter);
  font-size: 1.3rem;
`;

const Text = styled.p`
  font-size: 1.4rem;
  line-height: 1.8;
  color: var(--link-color);
  font-weight: 500;
  margin-bottom: 3rem;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  @media ${(props) => props.theme.mediaQueries.small} {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const LeftButtons = styled.div`
  margin-right: auto;
  display: flex;
  @media ${(props) => props.theme.mediaQueries.small} {
    margin-bottom: 2rem;
  }
  & > *:not(:last-child) {
    margin-right: 2rem;
    @media ${(props) => props.theme.mediaQueries.large} {
      margin-right: 1rem;
    }
  }
`;

const RightButtons = styled.div`
  margin-left: auto;
  display: flex;
  justify-content: space-between;
  @media ${(props) => props.theme.mediaQueries.small} {
    margin-bottom: 2rem;
  }
`;

const AWrapper = styled.a`
  text-decoration: none;
  margin-left: 1rem;
`;

//Movie Component
const MoviePage = ({
  location,
  config,
  match,
  movie,
  recommendations,
  getMovie,
  getMoviesRecommendations,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [modalOpened, setmodalOpened] = useState(false);
  const { secure_base_url } = config.base.images;
  const params = queryString.parse(location.search);

  // Fetch movie id when id on the url changes
  useEffect(() => {
    scroll.scrollToTop({
      smooth: true,
      delay: 500,
    });
    getMovie(match.params.id);
    return () => {
      setLoaded(false);
    };
  }, [match.params.id]);

  // Fetch recommended movies everytime recommendations page change
  useEffect(() => {
    getMoviesRecommendations(match.params.id, params.page);
  }, [params.page]);

  // If loading
  if (movie.loading) {
    return <Loader />;
  }

  if (movie.status_code) {
    history.push(process.env.PUBLIC_URL + "/404");
  }
  return (
    <Wrapper>
      <LazyLoad height={500}>
        <MovieWrapper>
          <ImageWrapper style={!loaded ? { display: "none" } : {}}>
            <MovieImg
              error={error ? 1 : 0}
              src={`${secure_base_url}w780${movie.poster_path}`}
              onLoad={() => setLoaded(true)}
              // If no image, error will occurr and  set error to true
              onError={(e) => {
                setError(true);
                if (e.target.src !== `${noImage}`) {
                  e.target.src = `${noImage}`;
                }
              }}
            />
          </ImageWrapper>
          <MovieDetails>
            <HeaderWrapper>
              <Title size="2" title={movie.title} subtitle={movie.tagline} />
            </HeaderWrapper>
            <DetailsWrapper>
              <RatingsWrapper>
                <Rating number={movie.vote_average / 2} />
                <RatingNumber>{movie.vote_average}</RatingNumber>
              </RatingsWrapper>
              <Info>
                {renderInfo(
                  movie.spoken_languages,
                  movie.runtime,
                  splitYear(movie.release_date)
                )}
              </Info>
            </DetailsWrapper>
            <Heading>The Genres</Heading>
            <LinksWrapper>{renderGenres(movie.genres)}</LinksWrapper>
            <Heading>The Synopsis</Heading>
            <Text>
              {movie.overview
                ? movie.overview
                : "There is no synopsis available..."}
            </Text>
            <Heading>The Cast</Heading>
            <Credits list={movie.list} secureUrl={secure_base_url} />
            <ButtonsWrapper>
              <LeftButtons>{renderBack()}</LeftButtons>
              <RightButtons>
                {renderTrailer(
                  movie.videos.results,
                  modalOpened,
                  setmodalOpened
                )}
                {renderWebsite(movie.homepage)}
                {renderImdb(movie.imdb_id)}
              </RightButtons>
            </ButtonsWrapper>
          </MovieDetails>
        </MovieWrapper>
      </LazyLoad>
      <Title title="Recommended" subtitle="movies" />
      {renderRecommended(recommendations, secure_base_url)}
    </Wrapper>
  );
};

//Render the back button if user was pushed into page
function renderBack() {
  return (
    <div onClick={history.goBack}>
      <Button title="Back" solid left icon="faArrowLeft" />
    </div>
  );
}

// Render Personal Website button
function renderWebsite(link) {
  if (!link) {
    return null;
  }
  return (
    <AWrapper target="_blank" href={link}>
      <Button title="Website" icon="faLink" />
    </AWrapper>
  );
}

// Render IMDB button
function renderImdb(id) {
  if (!id) {
    return null;
  }
  return (
    <AWrapper target="_blank" href={`https://www.imdb.com/title/${id}`}>
      <Button title="IMDB" icon="faArrowRight" />
    </AWrapper>
  );
}

// Render Trailer button
function renderTrailer(videos, modalOpened, setmodalOpened) {
  if (videos.length === 0) {
    return;
  } else if (videos.length === 1) {
    if (videos[0].type !== "Trailer" && videos[0].site !== "YouTube") return;
  } else {
    const { key } = videos.find(
      (video) => video.type === "Trailer" && video.site === "YouTube"
    );

    return (
      <React.Fragment>
        <div onClick={() => setmodalOpened(true)}>
          <Button title="Trailer" icon="faPlay" />
        </div>
        <ModalVideo
          channel="youtube"
          isOpen={modalOpened}
          videoId={key}
          onClose={() => setmodalOpened(false)}
        />
      </React.Fragment>
    );
  }
}

// Function to get the year
function splitYear(date) {
  if (!date) {
    return;
  }
  const [year] = date.split("-");
  return year;
}

// Render info of movie
function renderInfo(languages, time, data) {
  const info = [];
  if (languages.length !== 0) {
    info.push(languages[0].name);
  }
  info.push(time, data);
  return info
    .filter((el) => el !== null)
    .map((el) => (typeof el === "number" ? `${el} min.` : el))
    .map((el, i, array) => (i !== array.length - 1 ? `${el} / ` : el));
}

// Render recommended movies
function renderRecommended(recommendations, base_url) {
  if (recommendations.loading) {
    return <h2>Loading ...</h2>;
  } else if (recommendations.total_results === 0) {
    return (
      <NotFound
        title="Sorry!"
        subtitle={`There are no recommended movies...`}
      />
    );
  } else {
    return (
      <Element name="scroll-to-element">
        <Movies movies={recommendations} secureUrl={base_url} />;
      </Element>
    );
  }
}

// Render Genres with links
function renderGenres(genres) {
  return genres.map((genre) => (
    <StyledLink
      to={`${process.env.PUBLIC_URL}/genres/${genre.name}`}
      key={genre.id}>
      <FontAwesomeIcon
        icon="faDotCircle"
        size="1x"
        style={{ marginRight: "5px" }}
      />
      {genre.name}
    </StyledLink>
  ));
}

// Get state from store and pass as props to component
const mapStateToProps = ({ movie, config, recommendations }) => ({
  movie,
  config,
  recommendations,
});

export default connect(mapStateToProps, { getMovie, getMoviesRecommendations })(
  MoviePage
);
