import React, { useState, useEffect, useContext, useRef } from 'react'
import { StoreContext } from '../../contexts/StoreContext'
import { Title } from '../../components/Typography'
import { BrowseMenu, ChartOptions } from '../../components/Menus'
import { Grid, Card, CardHeader, CardContent } from '@material-ui/core'
import { ProposalsPieChart, ProposalsBarChart } from '../../components/Charts'
import { CircularLoader } from '../../components/Progress/Progress'
import { ProposalsTable } from '../../components/Tables'
import { SettingsContext } from '../../contexts/SettingsContext'

export const ProposalsByResourcesRequested = props => {
    const [store, ] = useContext(StoreContext)
    const [settings] = useContext(SettingsContext)
    const [proposalsByRequestedServices, setProposalsByRequestedServices] = useState()
    const [displayedProposals, setDisplayedProposals] = useState()
    const [tableTitle, setTableTitle] = useState('')
    const [chartType, setChartType] = useState('pie')
    const [chartSorting, setChartSorting] = useState('alpha')
    const [hideEmptyGroups, setHideEmptyGroups] = useState(settings.charts.hideEmptyGroups)
    const tableRef = useRef(null)
    
    useEffect(() => {
        if (store.proposals && store.services) {
            let services = store.services.map(service => ({ name: service, proposals: [] }))
            store.proposals.forEach(proposal => {
                proposal.requestedServices.forEach(service => {
                    const index = services.findIndex(({ name }) => service === name)
                    if (index >= 0) {
                        services[index].proposals.push(proposal)
                    }
                })
            })
            if (hideEmptyGroups) services = services.filter(service => service.proposals.length > 0)
            setProposalsByRequestedServices(services)
        }
    }, [store, hideEmptyGroups])

    const selectProposals = ({ id }) => {
        const index = proposalsByRequestedServices.findIndex(service => service.name === id)
        setTableTitle('Requested Services: ' + id)
        setDisplayedProposals(proposalsByRequestedServices[index].proposals)
        scrollToTable()
    }

    const handleSelectGraphType = (event, type) => setChartType(type)
    const handleSelectGraphSorting = (event, sorting) => setChartSorting(sorting)
    const handleToggleHideEmptyGroups = event => setHideEmptyGroups(event.target.checked)

    const scrollToTable = () => {
        setTimeout(() => tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 500)
    }

    return (
        <div>
            <Title>
                <Grid container>
                    <Grid item style={{ flex: 1 }}>
                        Proposals by Resources Requested
                    </Grid>
                    <Grid item>
                        <BrowseMenu />
                    </Grid>
                </Grid>
            </Title>

            <Grid container spacing="4">

                <Grid item xs={ 12 }>
                    <Card>
                        <CardHeader action={
                            <ChartOptions
                                sortingSelectionHandler={ handleSelectGraphSorting } currentSorting={ chartSorting }
                                typeSelectionHandler={ handleSelectGraphType } currentType={ chartType }
                                toggleHideEmptyGroupsHandler={ handleToggleHideEmptyGroups } hideEmptyGroups={ hideEmptyGroups }
                            />
                        } />
                        <CardContent>
                            {
                                proposalsByRequestedServices && chartType === 'pie'
                                && <ProposalsPieChart proposals={ proposalsByRequestedServices } clickHandler={ selectProposals } height={ 600 } sorting={ chartSorting } />
                            }
                            {
                                proposalsByRequestedServices && chartType === 'bar'
                                && <ProposalsBarChart proposals={ proposalsByRequestedServices } clickHandler={ selectProposals } height={ 400 } sorting={ chartSorting } />
                            }
                            { !proposalsByRequestedServices && <CircularLoader /> }
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={ 12 }>
                    <div ref={ tableRef }></div>
                    <ProposalsTable title={ tableTitle } proposals={ displayedProposals } paging={ false } />
                </Grid>

            </Grid>

        </div>
    )
}
