curl -o "./building_list_chi.csv" "https://www.chp.gov.hk/files/misc/building_list_chi.csv"
curl -o "./building_list_eng.csv" "https://www.chp.gov.hk/files/misc/building_list_eng.csv"
curl -o "./enhanced_sur_covid_19_chi.csv" "https://www.chp.gov.hk/files/misc/enhanced_sur_covid_19_chi.csv"
REM curl -o "./enhanced_sur_covid_19_eng.csv" "https://www.chp.gov.hk/files/misc/enhanced_sur_covid_19_eng.csv"
curl -o "./latest_situation_of_reported_cases_covid_19_chi.csv" "https://www.chp.gov.hk/files/misc/latest_situation_of_reported_cases_covid_19_chi.csv"
REM curl -o "./latest_situation_of_reported_cases_covid_19_eng.csv" "https://www.chp.gov.hk/files/misc/latest_situation_of_reported_cases_covid_19_eng.csv"

curl -o "./googleapis_maps.csv" "https://covid-hk.github.io/googleapis_maps.csv"

powershell -File "./filetime.ps1"

powershell -File "./googleapis_maps.ps1"
