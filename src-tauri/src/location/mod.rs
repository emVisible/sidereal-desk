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

    let resp = client
        .get("https://ipapi.co/json/")
        .send()
        .await
        .ok()?;

    #[derive(Deserialize)]
    struct IpResponse {
        latitude: f64,
        longitude: f64,
    }

    let data: IpResponse = resp.json().await.ok()?;
    Some(ObserverLocation {
        latitude: data.latitude,
        longitude: data.longitude,
        elevation: 0.0,
    })
}
