use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ObserverLocation {
    pub latitude: f64,
    pub longitude: f64,
    pub elevation: f64,
}

impl Default for ObserverLocation {
    fn default() -> Self {
        Self {
            latitude: 39.9042,
            longitude: 116.4074,
            elevation: 50.0,
        }
    }
}

pub fn get_default_location() -> ObserverLocation {
    ObserverLocation::default()
}

pub async fn fetch_location_from_ip() -> Option<ObserverLocation> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .build()
        .ok()?;

    // Try primary API first
    if let Some(loc) = try_ipapi(&client).await {
        return Some(loc);
    }

    // Fallback to secondary API if primary fails
    try_geoip_db(&client).await
}

async fn try_ipapi(client: &reqwest::Client) -> Option<ObserverLocation> {
    let resp = client
        .get("https://ipapi.co/json/")
        .send()
        .await
        .ok()?;

    #[derive(Deserialize)]
    struct IpResponse {
        latitude: Option<f64>,
        longitude: Option<f64>,
    }

    let data: IpResponse = resp.json().await.ok()?;
    
    match (data.latitude, data.longitude) {
        (Some(lat), Some(lon)) if lat.is_finite() && lon.is_finite() => {
            Some(ObserverLocation {
                latitude: lat,
                longitude: lon,
                elevation: 0.0,
            })
        }
        _ => None,
    }
}

async fn try_geoip_db(client: &reqwest::Client) -> Option<ObserverLocation> {
    let resp = client
        .get("https://geoip.json.bz/")
        .send()
        .await
        .ok()?;

    #[derive(Deserialize)]
    struct GeoIpResponse {
        latitude: Option<f64>,
        longitude: Option<f64>,
    }

    let data: GeoIpResponse = resp.json().await.ok()?;
    
    match (data.latitude, data.longitude) {
        (Some(lat), Some(lon)) if lat.is_finite() && lon.is_finite() => {
            Some(ObserverLocation {
                latitude: lat,
                longitude: lon,
                elevation: 0.0,
            })
        }
        _ => None,
    }
}
