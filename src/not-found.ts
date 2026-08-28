import './style.css';
import { bindChrome, focusRouteHeading, sharedDialogs, sharedRegions, siteFooter, siteHeader } from './chrome';

const root = document.querySelector<HTMLElement>('#not-found-root')!;
root.innerHTML = `${siteHeader()}<main id="main" class="not-found"><p class="eyebrow">404 · Wrong page</p><h1>This page is not in the reader.</h1><p>Return to the local PDF reader or open its sample document.</p><p class="not-found-actions"><a class="primary-button" href="/">Open the reader</a><a class="secondary-button" href="/?demo=1">Try the sample</a></p></main>${siteFooter()}${sharedRegions()}${sharedDialogs()}`;
bindChrome();
focusRouteHeading();
