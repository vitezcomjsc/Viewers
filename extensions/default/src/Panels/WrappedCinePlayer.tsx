import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { ServicesManager } from '@ohif/core';
import { CinePlayer, getEnabledElement } from '@ohif/extension-cornerstone';

export function WrappedCinePlayer({ servicesManager }) {
  const { viewportGridService } = servicesManager.services;

  const [viewportId, setViewportId] = useState(
    () => viewportGridService.getActiveViewportId() ?? null
  );

  const enabledVPElement = useMemo(
    () => (viewportId && getEnabledElement(viewportId)?.element) || null,
    [viewportId]
  );

  useEffect(() => {
    const events = [
      viewportGridService.EVENTS.VIEWPORTS_READY,
      viewportGridService.EVENTS.ACTIVE_VIEWPORT_ID_CHANGED,
    ];

    const subscriptions = events.map(event => {
      return viewportGridService.subscribe(event, ({ viewportId }) => {
        viewportId = viewportId || viewportGridService.getActiveViewportId();
        setViewportId(viewportId);
      });
    });

    return () => subscriptions.forEach(sub => sub.unsubscribe());
  }, [viewportGridService]);

  return (
    <CinePlayer
      key={viewportId}
      servicesManager={servicesManager}
      viewportId={viewportId}
      enabledVPElement={enabledVPElement}
    />
  );
}

WrappedCinePlayer.propTypes = {
  servicesManager: PropTypes.instanceOf(ServicesManager).isRequired,
};
