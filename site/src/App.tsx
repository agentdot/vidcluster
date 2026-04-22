import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomepageV2";
import Method from "./pages/Method";
import Research from "./pages/Research";
import Contact from "./pages/Contact";
import InsightsPage from "./pages/insights/index";
import FindTopicsPage from "./pages/insights/find-topics";
import WhyTrendsLatePage from "./pages/insights/why-trends-are-late";
import VidiqAlternativePage from "./pages/vidiq-alternative";
import TubebuddyAlternativePage from "./pages/tubebuddy-alternative";
import YoutubeTrendingIsUselessPage from "./pages/insights/youtube-trending-is-useless";
import TopicVsKeywordPage from "./pages/insights/topic-vs-keyword";
import ViralSpikeVsSustainedGrowthPage from "./pages/insights/viral-spike-vs-sustained-growth";
import VidiqVsTubebuddyVsVidclusterPage from "./pages/insights/vidiq-vs-tubebuddy-vs-vidcluster";
import ValidateTopicBeforeVideoPage from "./pages/insights/validate-topic-before-video";
import FindTopicsBeforeBigCreatorsPage from "./pages/insights/find-topics-before-big-creators";
import WhySmallCreatorsSpotTrendsEarlierPage from "./pages/insights/why-small-creators-spot-trends-earlier";
import TopicGrowingVsFlashingPage from "./pages/insights/topic-growing-vs-flashing";
import WhyTopicClustersMatterPage from "./pages/insights/why-topic-clusters-matter";





export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/method" element={<Method />} />
      <Route path="/research" element={<Research />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/insights" element={<InsightsPage />} />
      <Route path="/insights/find-topics" element={<FindTopicsPage />} />
      <Route path="/insights/why-trends-are-late" element={<WhyTrendsLatePage />} />
      <Route path="/vidiq-alternative" element={<VidiqAlternativePage />} />
      <Route path="/tubebuddy-alternative" element={<TubebuddyAlternativePage />} />
      <Route path="/insights/youtube-trending-is-useless" element={<YoutubeTrendingIsUselessPage />} />
      <Route path="/insights/topic-vs-keyword" element={<TopicVsKeywordPage />} />
      <Route path="/insights/viral-spike-vs-sustained-growth" element={<ViralSpikeVsSustainedGrowthPage />} />
      <Route path="/insights/vidiq-vs-tubebuddy-vs-vidcluster" element={<VidiqVsTubebuddyVsVidclusterPage />} />
      <Route path="/insights/validate-topic-before-video" element={<ValidateTopicBeforeVideoPage />} />
      <Route path="/insights/find-topics-before-big-creators" element={<FindTopicsBeforeBigCreatorsPage />} />
      <Route path="/insights/why-small-creators-spot-trends-earlier" element={<WhySmallCreatorsSpotTrendsEarlierPage />}/>
      <Route path="/insights/topic-growing-vs-flashing" element={<TopicGrowingVsFlashingPage />}/>
      <Route path="/insights/why-topic-clusters-matter" element={<WhyTopicClustersMatterPage />}/>      
    </Routes>
  );
}