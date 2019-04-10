<main class="markdown-body">

<img src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/apple/81/airplane_2708.png" align=right height=80>
# Tourism API
> REST API to query Neo4J Tourism Database

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=2 orderedList=false} -->

<!-- code_chunk_output -->

* [Tourism API](#tourism-api)
	* [Endpoints](#endpoints)
* [Database statistics](#database-statistics-1)
	* [Show number of users/reviews per year](#show-number-of-usersreviews-per-year)
	* [Show number of users/reviews per year and for given country](#show-number-of-usersreviews-per-year-and-for-given-country)
	* [Show number of users/reviews per year and for given country & dep](#show-number-of-usersreviews-per-year-and-for-given-country-dep)
* [National context](#national-context-1)
	* [Ingoing/outgoing evolution for a given year](#ingoingoutgoing-evolution-for-a-given-year)
	* [Info available for national request](#info-available-for-national-request)
* [International context](#international-context-1)
	* [Number of reviews per country for a given year](#number-of-reviews-per-country-for-a-given-year)
	* [Info available for international request](#info-available-for-international-request)
* [Grouping context](#grouping-context-1)
	* [Ingoing/outgoing evolution per year](#ingoingoutgoing-evolution-per-year)
	* [Info available for regional request](#info-available-for-regional-request)

<!-- /code_chunk_output -->

## Endpoints

### Database statistics

- [Show number of users/reviews per year](#show-number-of-usersreviews-per-year) : `GET /:city/stats/`
- [... and for a given country](#show-number-of-usersreviews-per-year-and-for-given-country) : `GET /:city/stats/:country`
- [... and for a given department](#show-number-of-usersreviews-per-year-and-for-given-country-dep) : `GET /:city/stats/:country/:dep`

### National context

- [Ingoing/outgoing evolution for a given year](#ingoingoutgoing-evolution-for-a-given-year) : `GET /:city/national/:year`
- [Info available for national request](#info-available-for-national-request) : `GET /:city/national/:year/info`

### International context

- [Number of reviews per country for a given year](#number-of-reviews-per-country-for-a-given-year) : `GET /:city/international/:year`
- [Info available for international request](#info-available-for-international-request) : `GET /:city/internnational/:year/info`

### Grouping context

- [Ingoing/outgoing evolution per year](#ingoingoutgoing-evolution-per-year) : `GET /:city/regional/:year/:name/:region`
- [Info available for grouping request](#info-available-for-regional-request) : `GET /:city/regional/:year/:name/:region/info`

# Database statistics

## Show number of users/reviews per year

|                  |                 |
| ---------------- | --------------- |
| **URL**          | `/:city/stats/` |
| **Method**       | **GET**         |
| **Success Code** |  200            |

### Success Response Content Example

```json
{
  "2010": {
    "year": 2010,
    "users": "12 929",
    "reviews": "42 687"
  },
  "2011": {
    "year": 2011,
    "users": "24 084",
    "reviews": "112 358"
  }
  ...
}
```

## Show number of users/reviews per year and for given country

|                    |                                                    |
| ------------------ | -------------------------------------------------- |
| **URL**            | `/:city/stats/:country`                            |
| **Method**         | **GET**                                            |
| **Success Code**   |  200                                               |
| **URL Parameters** | \* `country=[string]` : stats of specific country. |

### Success Response Content Example

```json
{
  "2010": {
    "year": 2010,
    "users": "12 929",
    "reviews": "42 687",
    "France": "6 283"
  },
  "2011": {
    "year": 2011,
    "users": "24 084",
    "reviews": "112 358",
    "France": "20 283"
  }
  ...
}
```

## Show number of users/reviews per year and for given country & dep

|                    |                                                    |
| ------------------ | -------------------------------------------------- |
| **URL**            | `/:city/stats/:country/:dep`                       |
| **Method**         | **GET**                                            |
| **Success Code**   |  200                                               |
| **URL Parameters** | \* `country=[string]` : stats of specific country. |
|                    | \* `dep=[string]` : stats of specific department.  |

### Success Response Content Example

```json
{
  "2010": {
    "year": 2010,
    "users": "12 929",
    "reviews": "42 687",
    "France": "6 283"
  },
  "2011": {
    "year": 2011,
    "users": "24 084",
    "reviews": "112 358",
    "France": "20 283"
  }
  ...
}
```

# National context

## Ingoing/outgoing evolution for a given year

|                    |                                                              |
| ------------------ | ------------------------------------------------------------ |
| **URL**            | `/:city/national/:year`                                      |
| **Method**         | **GET**                                                      |
| **Success Code**   |  200                                                         |
| **URL Parameters** | \* `year=[number]` : evolution year.                         |
|                    | `countries=[array[string]]` : evolution for these countries. |
|                    | `regions=[array[string]]` : evolution for these regions.     |
|                    | `ages=[array[string]]` : evolution for these age ranges.     |
|                    | `top=[number]` : top parameter for neo4j query.              |

### Success Response Content Example

```json
{
  "Evolution": {
    "Midi-Pyrénées": {
      "2015": {
        "Ingoing": 15.83,
        "Outgoing": 16.27
      },
      "2016": {
        "Ingoing": 16.14,
        "Outgoing": 16.51
      },
      "diff": {
        "Ingoing": 0.31,
        "Outgoing": 0.24
      }
    }
    ...
  },
  {
    "Monthly": {
    "Poitou-Charentes": {
      "Ingoing": {
        "months": [
          {
            "low": 88,
            "high": 0
          },
          {
            "low": 116,
            "high": 0
          }
          ...
      },
      "Outgoing": {...}
    }
  }
}
```

## Info available for national request

|                    |                                      |
| ------------------ | ------------------------------------ |
| **URL**            | `/:city/national/:year/info`         |
| **Method**         | **GET**                              |
| **Success Code**   |  200                                 |
| **URL Parameters** | \* `year=[number]` : evolution year. |

### Success Response Content Example

```json
{
  "topRegions": ["Centre", "Bretagne", "Limousin",...],
  "topCountries": ["France", "-", "Belgium",...],
  "topAges": ["13-17", "", "18-25",...]
}
```

# International context

## Number of reviews per country for a given year

|                    |                                                              |
| ------------------ | ------------------------------------------------------------ |
| **URL**            | `/:city/international/:year`                                 |
| **Method**         | **GET**                                                      |
| **Success Code**   |  200                                                         |
| **URL Parameters** | \* `year=[number]` : evolution year.                         |
|                    | `countries=[array[string]]` : evolution for these countries. |
|                    | `areas=[array[string]]` : evolution for these areas.         |
|                    | `ages=[array[string]]` : evolution for these age ranges.     |
|                    | `top=[number]` : top parameter for neo4j query.              |

### Success Response Content Example

```json
{
  "Evolution": {
    "France": {
      "2015": 57.84,
      "2016": 55.78,
      "diff": -2.06
    },
    "-": {
      "2015": 31.21,
      "2016": 34.07,
      "diff": 2.86
    },
  },
  "Monthly": {
    "France": {
      "Reviews": {
        "months": [
          {
            "low": 5840,
            "high": 0
          },
          ..
      }
    }
  }
}
```

## Info available for international request

|                    |                                      |
| ------------------ | ------------------------------------ |
| **URL**            | `/:city/international/:year/info`    |
| **Method**         | **GET**                              |
| **Success Code**   |  200                                 |
| **URL Parameters** | \* `year=[number]` : evolution year. |

### Success Response Content Example

```json
{
  "topCountries": ["France", "-", "Belgium",...],
  "topAges": ["13-17", "", "18-25",...]
}
```

# Grouping context

## Ingoing/outgoing evolution per year

|                    |                                                              |
| ------------------ | ------------------------------------------------------------ |
| **URL**            | `/:city/grouping/:year/:name/:region`                        |
| **Method**         | **GET**                                                      |
| **Success Code**   |  200                                                         |
| **URL Parameters** | \* `year=[number]` : evolution year.                         |
|                    | \* `name=[number]` : name for neo4j request.                 |
|                    | \* `region=[number]` : evolution for this region.            |
|                    | `countries=[array[string]]` : evolution for these countries. |
|                    | `areas=[array[string]]` : evolution for these areas.         |
|                    | `ages=[array[string]]` : evolution for these age ranges.     |
|                    | `top=[number]` : top parameter for neo4j query.              |

### Success Response Content Example

```json
{
  "Evolution": {
    "Midi-Pyrénées": {
      "2015": {
        "Ingoing": 15.83,
        "Outgoing": 16.27
      },
      "2016": {
        "Ingoing": 16.14,
        "Outgoing": 16.51
      },
      "diff": {
        "Ingoing": 0.31,
        "Outgoing": 0.24
      }
    }
    ...
  },
  {
    "Monthly": {
    "Poitou-Charentes": {
      "Ingoing": {
        "months": [
          {
            "low": 88,
            "high": 0
          },
          {
            "low": 116,
            "high": 0
          }
          ...
      },
      "Outgoing": {...}
    }
  }
}
```

## Info available for regional request

|                    |                                                     |
| ------------------ | --------------------------------------------------- |
| **URL**            | `/:city/international/:year/info`                   |
| **Method**         | **GET**                                             |
| **Success Code**   |  200                                                |
| **URL Parameters** | \* `year=[number]` : evolution year.                |
|                    | \* `name=[number]` : name for neo4j request.        |
|                    | \* `region=[number]` : evolution for this region.   |

### Success Response Content Example

```json
{
  "topCountries": ["France", "-", "Belgium",...],
  "topAreas": ["Bordeaux",...],
  "topAges": ["13-17", "", "18-25",...]
}
```
