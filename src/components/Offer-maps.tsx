import UniversalCards from "./Universal-cards";

const OfferMaps = () => {
    return(
    <>
        <UniversalCards
          MapClass="Cross-platform"
          HeaderClass="Cross-platform-headline"
          HeaderChildren="Кроссплатформенность"
          ImageClass="Cross-platform-icon"
          TextClass="Cross-platform-text"
          children="Используйте один впн сервер на всех устройствах"
        />
        <UniversalCards
          MapClass="Regions"
          HeaderClass="Regions-headline"
          HeaderChildren="100+ Регионов"
          ImageClass="Regions-icon"
          TextClass="Regions-text"
          children="Общирный список серверов на любой выбор"
        />
        <UniversalCards
          MapClass="Speed"
          HeaderClass="Speed-headline"
          HeaderChildren="Скорость"
          ImageClass="Speed-icon"
          TextClass="Speed-text"
          children="Скорость более 10 Гбит/сек"
        />
        <UniversalCards
          MapClass="TechnicalSupport"
          HeaderClass="TechnicalSupport-headline"
          HeaderChildren="Техподдержка"
          ImageClass="TechnicalSupport-icon"
          TextClass="TechnicalSupport-text"
          children="Отвечает в течении 30 минут "
        />
    </>
    )
}

export default OfferMaps