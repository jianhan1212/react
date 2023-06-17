import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "@emotion/styled";
//匯入 Emotion 提供的 css 函式
// import { css } from "@emotion/react";
import { ReactComponent as AirFlowIcon } from "./images/3741354_weather_wind_windy_icon.svg"
import { ReactComponent as RainIcon } from "./images/2682807_drop_high_humidity_percentage_precipitation_icon.svg"
import { ReactComponent as RedoIcon } from "./images/5208415_redo_refresh_reload_repeat_rotate_icon.svg"
import WeatherIcon from "./WeatherIcon";
import sunriseAndSunsetData from "./sunrise-sunset.json"
//將一批 CSS 樣式定義成 JavaScript 函式
// const buttonDefault = () => css`
//     display: block;
//     width: 120px;
//     height: 30px;
//     font-size: 14px;
//     background-color: transparent;
// `;

// const RejectButton = styled.button`
//     ${buttonDefault}
//     background-color: red;
// `;

const Container = styled.div`
    background-color: #ededed;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const WeatherCard = styled.div`
    position: relative;
    min-width: 360px;
    box-shadow: 0 1px 3px 0 #999999;
    background-color: #f9f9f9;
    box-sizing: border-box;
    padding: 30px 15px;
`;

const Location = styled.div`
    font-size: 28px;
    color: ${props => props.theme === "dark" ? "#dadada" : "#212121"};
    margin-bottom: 20px;
`;

const Description = styled.div`
  font-size: 16px;
  color: #828282;
  margin-bottom: 30px;
`;

const CurrentWeather = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Temperature = styled.div`
  color: #757575;
  font-size: 96px;
  font-weight: 300;
  display: flex;
`;

const Celsius = styled.div`
  font-weight: normal;
  font-size: 42px;
`;

const AirFlow = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: #828282;
  margin-bottom: 20px;

  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }
`;

const Rain = styled.div`
  display: flex;
  align-items: center;
  font-size: 16x;
  font-weight: 300;
  color: #828282;

  svg {
    width: 25px;
    height: auto;
    margin-right: 30px;
  }

`;

// 透過 styled(組件) 來把樣式帶入已存在的組件中



const Redo = styled.div`
    position: absolute;
    bottom: 15px;
    right: 15px;
    font-size: 12px;
    display: inline-flex;
    align-items: flex-end;
    color: #828282;

    svg {
        margin-left: 10px;
        width: 15px;
        height: 15px;
        cursor: pointer;
    }
`;

const fetchCurrentWeather = () => {
    // STEP 3-1：修改函式，把 fetch API 回傳的 Promise 直接回傳出去
    return fetch(
        'https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-1DF458CB-E37C-4A96-B1E7-6A969D6A4C5A&locationName=臺中',
    )
        .then((response) => response.json())
        .then((data) => {
            const locationData = data.records.location[0];

            const weatherElements = locationData.weatherElement.reduce(
                (neededElements, item) => {
                    if (['WDSD', 'TEMP', 'HUMD'].includes(item.elementName)) {
                        neededElements[item.elementName] = item.elementValue;
                    }
                    return neededElements;
                },
                {},
            );
            console.log(data);
            // STEP 3-2：把取得的資料內容回傳出去，而不是在這裡 setWeatherElement
            return {
                observationTime: locationData.time.obsTime,
                locationName: locationData.locationName,
                temperature: weatherElements.TEMP,
                windSpeed: weatherElements.WDSD,
                humid: weatherElements.HUMD,
            };
        });
       
};

const fetchWeatherForecast = () => {
    // STEP 4-1：修改函式，把 fetch API 回傳的 Promise 直接回傳出去
    return fetch(
        'https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-1DF458CB-E37C-4A96-B1E7-6A969D6A4C5A&locationName=臺中市',
    )
        .then((response) => response.json())
        .then((data) => {
            const locationData = data.records.location[0];
            const weatherElements = locationData.weatherElement.reduce(
                (neededElements, item) => {
                    if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
                        neededElements[item.elementName] = item.time[0].parameter;
                    }
                    return neededElements;
                },
                {},
            );

            // STEP 4-2：把取得的資料內容回傳出去，而不是在這裡 setWeatherElement
            return {
                description: weatherElements.Wx.parameterName,
                weatherCode: weatherElements.Wx.parameterValue,
                rainPossibility: weatherElements.PoP.parameterName,
                comfortability: weatherElements.CI.parameterName,
            };
        });
};

const getMoment = (locationName) => {
    // 從日出日落時間中找出符合的地區
    const location = sunriseAndSunsetData.find(
        (data) => data.CountyName === (locationName+"市")
    );
    console.log(locationName);
    // 找不到的話則回傳 null
    if(!location) return null;

    // 取得當前時間
    const now = new Date();

    // 將當前時間以 "2023-06-16" 的時間格式呈現
    const nowDate = Intl.DateTimeFormat('zh-TW', {
        year: 'numeric',
        month: "2-digit",
        day: "2-digit",
    }).format(now).replace(/\//g, '-')

    // 從該地區中找到對應的日期
    const locationDate = location.time && location.time.find((time) => time.Date === nowDate);

    // 將日出日落以及當前時間轉成時間戳記（TimeStamp）
    const sunriseTimestamp = new Date(
        `${locationDate.Date} ${locationDate.SunRiseTime}`
    ).getTime();
    const sunsetTimestamp = new Date(
        `${locationDate.Date} ${locationDate.SunSetTime}`
    ).getTime();

    const nowTimeStamp = now.getTime();

    // 若當前時間介於日出和日落中間，則表示為白天，否則為晚上
    return sunriseTimestamp <= nowTimeStamp && nowTimeStamp <= sunsetTimestamp
    ? "day"
    : "night";

};


const App = () => {
    console.log("---invoke---");

    const [weatherElement, setWeatherElement] = useState({
        observationTime: new Date(),
        locationName: '',
        humid: 0,
        temperature: 0,
        windSpeed: 0,
        description: '',
        weatherCode: 0,
        rainPossibility: 0,
        comfortability: '',
    })

    const fetchData = useCallback(() => {

        const fetchingData = async () => {
            console.log("test");
            // STEP 2：使用 Promise.all 搭配 await 等待兩個 API 都取得回應後才繼續
            // STEP 6：使用陣列的解構賦值把資料取出
            const [currentWeather, weatherForecast] = await Promise.all([
                fetchCurrentWeather(),
                fetchWeatherForecast(),
            ]);
            
            // STEP 7：把取得的資料透過物件的解構賦值放入
            setWeatherElement({
                ...currentWeather,
                ...weatherForecast,
            });
        };

        fetchingData();

    },[])

    const moment = useMemo(() => getMoment(weatherElement.locationName), [weatherElement.locationName,]);
    
    useEffect(() => {
        console.log("execute");

        fetchData();

    }, [fetchData]);


    return (
        <Container>
            {console.log("render")}
            <WeatherCard>
                <Location theme="dark">{weatherElement.locationName}</Location>
                <Description>
                    {weatherElement.description}
                </Description>
                <CurrentWeather>
                    <Temperature>{Math.round(weatherElement.temperature)}
                        <Celsius>℃</Celsius>
                    </Temperature>
                    <WeatherIcon 
                        currentWeatherCode={weatherElement.weatherCode}
                        moment={moment || 'day'}
                    />
                </CurrentWeather>
                <AirFlow>
                    <AirFlowIcon />
                    {weatherElement.windSpeed} m/h
                </AirFlow>
                <Rain>
                    <RainIcon />
                    {weatherElement.rainPossibility}%
                </Rain>
                <Redo onClick={fetchData}>
                    最後觀測時間 :{" "}
                    {new Intl.DateTimeFormat('zh-TW', {
                        hour: 'numeric',
                        minute: 'numeric',
                    }).format(new Date(weatherElement.observationTime))}{" "}
                    <RedoIcon />
                </Redo>
            </WeatherCard>
        </Container>
    );
}

export default App