import CollectionSyncer from './syncers/collection'
import ItemSyncer from './syncers/item'

/**
 * Chooses and returns the preferred syncer
 *
 * @param Vue
 * @param vm
 * @param path
 * @param settings
 * @returns {BaseFeathersSyncer}
 */
export default function syncerChooser(Vue, vm, path, settings) {
	if (typeof settings === 'string') {
		settings = {
			service: settings
		}
	}

	// Choose syncer to use
	if ('id' in settings) {
		return new ItemSyncer(Vue, vm, path, settings)
	}
	return new CollectionSyncer(Vue, vm, path, settings)
}
