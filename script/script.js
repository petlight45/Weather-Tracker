function lat_long_format(type, val){
    if (type == "lon"){
        suffix = (val < 0)?"W":"E";
    }else{
        suffix = (val < 0)?"S":"N";
    }

    val = Math.abs(val)
    degree = Math.floor(val)
    minutes = Math.floor((val-degree)*60);
    seconds = Math.round((((val-degree)*60)-minutes)*60)
    return [degree,minutes,seconds,suffix]
}


function parse_date(date){
    return `${date.getHours()}:${date.getMinutes()}`
}

$(function(){
    function rand_col(){
        return Math.floor(Math.random()*256)
    }
    function test(){
        $("div.test").css("background-color",`rgb(${rand_col()},${rand_col()},${rand_col()})`)
    }

    // test()
    let container = $("div.wrapper").clone()
    let error = $("div.error").clone()
    $("div.wrapper").remove("div.wrapper");
    $("div.error").remove("div.error");
    container.removeClass("hidden");
    error.removeClass("hidden");
    function clean(){
    $("div.error").remove("div.error");
    $("div.wrapper").remove("div.wrapper");
    }
    clean()
    $('.city_input, .button_go').on("keypress", function(e){
        $("div.test").text(e.charCode)
        if (e.charCode === 13){
            call_ajax()
        }
    })

    $('.button_go').on('click',function(e){
        e.preventDefault()
        test()
        call_ajax()
    })

    function call_ajax(){
        clean();
        $("div.loader").removeClass('hidden'); 
        if (!$('input.city_input').val()){
            clean()
            var working_item = error.clone();
            working_item.text("Enter a city name")
            $("div.loader").addClass('hidden')
            $("#output").append(working_item)
            return
        }
    $.ajax({
        type:"GET",
        url:`https://api.openweathermap.org/data/2.5/weather?q=${$('input.city_input').val()}&APPID=7ad0f14cc2159dcf1be3f5d7ab3d5316`,
        success:function(data){
            var working_item;
            working_item = container.clone()
            $(".location .name span.city", working_item).text(data.name);
            $(".location .name span.country", working_item).text(data.sys.country);
            let lat_format = lat_long_format("lat", data.coord.lat)
            let lon_format = lat_long_format("lon", data.coord.lon)
            $(".location .coords #lat span.val", working_item).html(`${lat_format[0]}&#176 ${lat_format[1]}' ${lat_format[2]}'' ${lat_format[3]}`);
            $(".location .coords #long span.val", working_item).html(`${lon_format[0]}&#176 ${lon_format[1]}' ${lon_format[2]}'' ${lon_format[3]}`);
            $("#marker", working_item).attr("href",`https://www.google.com/maps/search/?api=1&query=${data.coord.lat},${data.coord.lon}`)
            $(".icon-wrapper img", working_item).attr("src",`https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`);
            $(".weather-desc span.main", working_item).text(data.weather[0].main);
            $(".weather-desc span.dsc", working_item).text(data.weather[0].description);
            $(".conditions .temp span.val", working_item).text((data.main.temp -273).toFixed(2));
            $(".conditions .humid span.val", working_item).text(data.main.humidity);
            $(".conditions .wind span.val", working_item).text(data.wind.speed);
            let tzone = data.timezone
            $.ajax({
                type:"GET",
                url:`https://showcase.api.linx.twenty57.net/UnixTime/fromunix?timestamp=${data.sys.sunset}`,
                success:function(data){
                    $(".s-illu .sunset .utc", working_item).text(`${parse_date(new Date(data))} (UTC)`)},
                error:function(){
                    $(".s-illu .sunset .utc", working_item).text(`${parse_date(data.sys.sunset * 1000)} (UTC)`)}
                })
            $.ajax({
                type:"GET",
                url:`https://showcase.api.linx.twenty57.net/UnixTime/fromunix?timestamp=${data.sys.sunset + tzone}`,
                success:function(data){
                    $(".s-illu .sunset .local", working_item).text(`${parse_date(new Date(data))} (Local Time)`)
                },
                error:function(){
                    $(".s-illu .sunset .local", working_item).text(`${parse_date(new Date((data.sys.sunset + tzone)*1000))} (Local Time)`)
                }})
            $.ajax({
                type:"GET",
                url:`https://showcase.api.linx.twenty57.net/UnixTime/fromunix?timestamp=${data.sys.sunrise}`,
                success:function(data){
                    $(".s-illu .sunrise .utc", working_item).text(`${parse_date(new Date(data))} (UTC)`)},
                error:function(){
                    $(".s-illu .sunrise .utc", working_item).text(`${parse_date(data.sys.sunrise * 1000)} (UTC)`)}
            })
            $.ajax({
                type:"GET",
                url:`https://showcase.api.linx.twenty57.net/UnixTime/fromunix?timestamp=${data.sys.sunrise + tzone}`,
                success:function(data){
                    $(".s-illu .sunrise .local", working_item).text(`${parse_date(new Date(data))} (Local Time)`)
                },
                error:function(){
                    $(".s-illu .sunrise .local", working_item).text(`${parse_date(new Date((data.sys.sunrise + tzone)*1000))} (Local Time)`)
                }})
            $("div.loader").addClass('hidden')
            $("#output").append(working_item)
        },
        error:function(e){
            clean()
            var working_item = error.clone();
            working_item.text(e.responseJSON.message)
            $("div.loader").addClass('hidden')
            $("#output").append(working_item)
        }
    });}

})